import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Match, MatchDocument } from './schema/match.schema';
import { Model, ObjectId, Promise } from 'mongoose';
import { DeckService } from '../deck/deck.service';
import { InjectPubSub } from '../../lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import {
  CONFIRM_TURN_EVENT,
  END_TURN_EVENT,
  MATCH_ENDED,
  MATCH_STARTED,
  PREPARE_TURN_EVENT,
  REWARD_RECEIVED,
} from './subscription/match.trigger';
import { PlayerStatusModel } from './model/player-status.model';
import { xPromise } from '../../common/util/bluebird';
import { User, UserDocument } from '../user/schema/user.schema';
import { CardTokenModel } from '../card/model/card-token.model';
import { BoardCardModel } from './model/board-card.model';
import { CardType } from '../card/enum/card-type.enum';
import { CardSkill } from '../card/schema/card.schema';
import { unionBy } from 'lodash';
import { PrepareTurnEventModel } from './model/prepare-turn-event.model';
import { PrepareTurnEventType } from './enum/prepare-turn-event-type.enum';
import { InjectQueue } from '@nestjs/bull';
import { MATCH_QUEUE } from '../../config/bull/queue.constant';
import { Queue } from 'bull';
import { MatchProcess } from './consumer/match.process';
import { MatchTimeoutJobType } from './type/match-timeout-job.type';
import { humanInterval } from '../../common/util';
import { CardSkillType } from '../card/enum/card-skill-type.enum';
import { AttackEventModel } from './model/attack-event.model';
import { ConfirmTurnEventModel } from './model/confirm-turn-event.model';
import { randomInt } from 'crypto';
import { CardService } from '../card/card.service';
import { RewardModel } from './model/reward.model';
import { EndTurnEventModel } from './model/end-turn-event.model';

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name) private readonly model: Model<MatchDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectQueue(MATCH_QUEUE) private readonly matchQueue: Queue,
    @InjectPubSub() private readonly pubSub: RedisPubSub,
    private readonly deckService: DeckService,
    private readonly cardService: CardService,
  ) {}

  get matchModel() {
    return this.model;
  }

  async surrender(user: UserDocument) {
    const userId = user._id.toString();
    const match = await this.getPlayingMatchOrFail(user);
    const { playerStatuses } = match;
    const winnerStatus = playerStatuses.find((s) => s.playerId !== userId);

    await this.endMatch(match, winnerStatus.playerId);
  }

  async confirmTurn(user: UserDocument) {
    const userId = user._id.toString();
    const match = await this.getPlayingMatchOrFail(user);
    const { playerStatuses } = match;
    const currentStatus = this.findPlayerStatusOrFail(userId, playerStatuses);
    const { inTurn, confirmTurn } = currentStatus;
    this.validateInTurnAction(inTurn, confirmTurn);

    const targetStatus = playerStatuses.find(
      (s) => s.playerId !== currentStatus.playerId,
    );

    if (!targetStatus) {
      return;
    }

    const { onBoard: currentOnBoard } = currentStatus;
    let { onBoard: targetOnBoard } = targetStatus;

    const attackEvents = [];

    for (const currentCard of currentOnBoard) {
      const { skills } = currentCard;
      for (const skill of skills) {
        const attackEvent = this.castSkill(currentCard, skill, targetOnBoard);
        attackEvents.push(attackEvent);

        if (attackEvent) {
          targetOnBoard = attackEvent.targetOnBoard;

          if (targetOnBoard.length === 0) {
            break;
          }
        }
      }
    }

    await this.model.updateOne(
      {
        _id: match._id,
      },
      {
        $set: {
          playerStatuses: playerStatuses.map((s) =>
            s.playerId === targetStatus.playerId
              ? {
                  ...targetStatus,
                  onBoard: targetOnBoard,
                }
              : s,
          ),
        },
      },
    );

    const confirmTurnEvent: ConfirmTurnEventModel = {
      playerId: userId,
      attacks: attackEvents,
      currentMatchStatus: await this.findByIdOrFail(match.id),
    };

    await this.pubSub.publish(CONFIRM_TURN_EVENT, {
      [CONFIRM_TURN_EVENT]: confirmTurnEvent,
    });
  }

  async endMatch(match: MatchDocument, winnerId: string) {
    await this.model
      .updateOne(
        {
          _id: match._id,
        },
        {
          $set: {
            winner: winnerId,
          },
        },
      )
      .exec();

    await this.pubSub.publish(MATCH_ENDED, {
      [MATCH_ENDED]: (await this.findByIdOrFail(match._id)).toObject(),
    });

    const winner = await this.userModel.findById(winnerId).exec();

    if (!winner) {
      return;
    }

    const reward = await this.cardService.mintRandom(winner);
    await this.pubSub.publish(REWARD_RECEIVED, {
      [REWARD_RECEIVED]: {
        playerId: winnerId,
        token: reward,
      } as RewardModel,
    });
  }

  async denyCard(user: UserDocument, tokenId: string) {
    const userId = user._id.toString();
    const match = await this.getPlayingMatchOrFail(user);
    const { playerStatuses } = match;
    const { inTurn, confirmTurn, onHand, crystal } =
      this.findPlayerStatusOrFail(userId, playerStatuses);
    this.validateInTurnAction(inTurn, confirmTurn);

    const card = this.findTokenOrFail(tokenId, onHand);

    const newCrystal = crystal + (card.type === CardType.MONSTER ? 2 : 1);
    const newOnHand = onHand.filter((c) => c.tokenId === tokenId);

    await this.model
      .updateOne(
        {
          _id: match._id,
        },
        {
          $set: {
            playerStatuses: playerStatuses.map((s) =>
              s.playerId === userId
                ? {
                    ...s,
                    onHand: newOnHand,
                    crystal: newCrystal,
                  }
                : s,
            ),
          },
        },
      )
      .exec();

    const event: PrepareTurnEventModel = {
      type: PrepareTurnEventType.DENY_CARD,
      playerId: userId,
      tokenId,
      currentMatchStatus: await this.findByIdOrFail(match._id),
    };

    await this.pubSub.publish(PREPARE_TURN_EVENT, {
      [PREPARE_TURN_EVENT]: event,
    });
  }

  async endTurn(user: UserDocument) {
    const userId = user._id.toString();
    const match = await this.getPlayingMatchOrFail(user);
    const { playerStatuses, timeoutJobId } = match;
    const { inTurn, confirmTurn } = this.findPlayerStatusOrFail(
      userId,
      playerStatuses,
    );

    if (!inTurn || !confirmTurn) {
      throw new ForbiddenException('Not your turn');
    }

    const currentTimeOutJob = await this.matchQueue.getJob(timeoutJobId);

    if (currentTimeOutJob) {
      await currentTimeOutJob.remove();
    }

    const winnerStatus = this.getWinnerStatus(match);

    if (winnerStatus) {
      await this.endMatch(match, winnerStatus.playerId);

      return;
    }

    const timeoutJob = await this.createMatchTimoutJob(match);

    await this.matchModel
      .updateOne(
        {
          _id: match._id,
        },
        {
          $set: {
            playerStatuses: playerStatuses.map((s) =>
              s.playerId === userId
                ? {
                    ...s,
                    inTurn: false,
                    confirmTurn: false,
                  }
                : {
                    ...s,
                    inTurn: true,
                    confirmTurn: false,
                    crystal: s.crystal + 3,
                  },
            ),
            timeoutJobId: timeoutJob.id.toString(),
          },
        },
      )
      .exec();

    const event: EndTurnEventModel = {
      playerId: userId,
      currentMatchStatus: await this.findByIdOrFail(match._id),
    };

    await this.pubSub.publish(END_TURN_EVENT, {
      [END_TURN_EVENT]: event,
    });
  }

  async putToBoard(user: UserDocument, tokenId: string, position: number) {
    const userId = user._id.toString();
    const { playerStatuses, _id } = await this.getPlayingMatchOrFail(user);
    const matchId = _id.toString();
    const { onBoard, inTurn, confirmTurn, crystal, onHand } =
      this.findPlayerStatusOrFail(userId, playerStatuses);

    await this.validateInTurnAction(inTurn, confirmTurn);

    const cardInPosition = this.cardInBoardPosition(position, onBoard);
    const cardToPut = this.findTokenOrFail(tokenId, onHand);
    this.validateCanPutCard(crystal, cardToPut, cardInPosition);

    const newOnHand = onHand.filter((c) => c.tokenId !== tokenId);
    const newOnBoard = onBoard.concat(
      this.putCardToPosition(cardToPut, position, cardInPosition),
    );
    const newCrystal = crystal - cardToPut.cost;

    await this.model.updateOne(
      {
        id: _id,
      },
      {
        $set: {
          playerStatuses: playerStatuses.map((s) =>
            s.playerId === userId
              ? {
                  ...s,
                  onHand: newOnHand,
                  onBoard: newOnBoard,
                  crystal: newCrystal,
                }
              : s,
          ),
        },
      },
    );

    const event: PrepareTurnEventModel = {
      type: PrepareTurnEventType.PUT_CARD,
      playerId: userId,
      tokenId,
      toPosition: position,
      currentMatchStatus: await this.findByIdOrFail(matchId),
    };

    await this.pubSub.publish(PREPARE_TURN_EVENT, {
      [PREPARE_TURN_EVENT]: event,
    });
  }

  async createMatch(player1Id: string, player2Id: string) {
    const playerIds =
      Math.random() >= 0.5 ? [player1Id, player2Id] : [player2Id, player1Id];

    const playerStatuses = await xPromise.map(
      playerIds,
      async (userId, index): Promise<PlayerStatusModel> => {
        const deck = await this.deckService.ownedDeckByUserId(userId);
        const cards = await this.deckService.getDeckCardModels(deck.deckCards);

        return {
          playerId: userId,
          onHand: cards,
          onBoard: [],
          crystal: index === 0 ? 3 : 0,
          inTurn: index === 0,
          confirmTurn: false,
        };
      },
    );

    const match = new this.model({
      playerStatuses,
    });
    await match.save();

    const matchWithTimeout = await this.addTimoutJobToMatch(match);

    await this.pubSub.publish(MATCH_STARTED, {
      [MATCH_STARTED]: matchWithTimeout.toObject(),
    });

    return match;
  }

  private getWinnerStatus(match: MatchDocument) {
    const { playerStatuses } = match;

    const loser = playerStatuses.find(
      ({ onHand, onBoard }) =>
        onHand.filter((c) => c.type === CardType.MONSTER).length === 0 &&
        onBoard.length === 0,
    );

    if (!loser) {
      return undefined;
    }

    return playerStatuses.find((s) => s.playerId !== loser.playerId);
  }

  private castSkill(
    card: BoardCardModel,
    skill: CardSkill,
    targetBoard: BoardCardModel[],
  ): AttackEventModel | undefined {
    const { type } = skill;
    const { position } = card;

    if (!this.canAttack(position, type)) {
      return undefined;
    }

    const target = this.getTarget(position, type, targetBoard);
    if (!target) {
      return undefined;
    }

    const targetHp = this.getHPOf(target);
    const dame = this.getDame(skill);

    return {
      skill: skill,
      tokenId: card.tokenId,
      toPosition: target.position,
      damage: dame,
      destroy: targetHp - dame <= 0,
      targetOnBoard: targetBoard
        .map((c) => (c.tokenId === target.tokenId ? this.subHPOf(c, dame) : c))
        .filter((c) => this.getHPOf(c) > 0),
    };
  }

  private getDame(skill: CardSkill) {
    const { type, value } = skill;

    if (type === CardSkillType.RANDOM) {
      return randomInt(Math.floor(value / 2), Math.ceil(value * 1.5) + 1);
    }

    return value;
  }

  private canAttack(position: number, skillType: CardSkillType) {
    if (
      ![
        CardSkillType.MELEE,
        CardSkillType.RANGED,
        CardSkillType.RANDOM,
        CardSkillType.MAGIC,
      ].includes(skillType)
    ) {
      return false;
    }

    if (skillType === CardSkillType.MELEE) {
      return position === 1;
    }

    return position !== 1;
  }

  private getTarget(
    position: number,
    skillType: CardSkillType,
    targetBoard: BoardCardModel[],
  ) {
    if (skillType === CardSkillType.MELEE) {
      return targetBoard.find((c) => c.position === 1);
    }

    if (skillType === CardSkillType.MAGIC) {
      return targetBoard.find((c) => c.position === position);
    }

    if (skillType === CardSkillType.RANGED) {
      const diagonal = this.getDiagonal(position);

      return (
        targetBoard.find((c) => c.position === diagonal) ||
        targetBoard.find((c) => c.position === position)
      );
    }

    if (skillType === CardSkillType.RANDOM) {
      return targetBoard[Math.floor(Math.random() * targetBoard.length)];
    }

    return undefined;
  }

  private getDiagonal(position: number) {
    if (position === 2) {
      return 3;
    }

    if (position === 3) {
      return 2;
    }

    return 1;
  }

  private subHPOf(card: BoardCardModel, dame: number): BoardCardModel {
    return {
      ...card,
      skills: card.skills.map((s) =>
        s.type === CardSkillType.HP
          ? {
              ...s,
              value: s.value - dame > 0 ? s.value - dame : 0,
            }
          : s,
      ),
    };
  }

  private getHPOf(card: CardTokenModel) {
    return card.skills.find((s) => s.type === CardSkillType.HP)?.value || 0;
  }

  private validateInTurnAction(inTurn: boolean, confirmTurn: boolean) {
    if (!inTurn) {
      throw new ForbiddenException('You are not in turn');
    }

    if (confirmTurn) {
      throw new ForbiddenException('You are confirmed turn');
    }
  }

  private putCardToPosition(
    cardToPut: CardTokenModel,
    position: number,
    cardInPosition?: BoardCardModel,
  ): BoardCardModel {
    const putEquipment = cardToPut.type === CardType.EQUIPMENT;

    if (putEquipment) {
      return {
        ...cardInPosition,
        equipment: cardToPut,
        skills: this.combineCollectionSkills(
          cardInPosition.skills,
          cardToPut.skills.map((skill) =>
            skill.type === CardSkillType.ARMOR
              ? {
                  ...skill,
                  type: CardSkillType.HP,
                }
              : skill,
          ),
        ),
      };
    } else {
      return {
        ...cardToPut,
        position,
      };
    }
  }

  private combineCollectionSkills(
    collection1: CardSkill[],
    collection2: CardSkill[],
  ): CardSkill[] {
    const upCol = collection1.map((s1) => {
      const found = collection2.find((s2) => s2.type === s1.type);

      return found
        ? {
            ...s1,
            value: s1.value + found.value,
          }
        : s1;
    });

    return unionBy<CardSkill>(upCol.concat(collection2), (s) => s.type);
  }

  private validateCanPutCard(
    currentCrystal: number,
    cardToPut: CardTokenModel,
    cardInBoard?: BoardCardModel,
  ) {
    if (currentCrystal < cardToPut.cost) {
      throw new ForbiddenException('Not enough crystal to put card');
    }

    const putEquipment = cardToPut.type === CardType.EQUIPMENT;
    const putMonster = cardToPut.type === CardType.MONSTER;
    const haveCardInBoard = !!cardInBoard;
    const notHaveCardInBoard = !cardInBoard;
    const cardInBoardHaveEquipment = !!cardInBoard?.equipment;

    if (notHaveCardInBoard && putEquipment) {
      throw new BadRequestException('Can not put equipment to empty position');
    }

    if (haveCardInBoard && putMonster) {
      throw new BadRequestException('This position already placed a card');
    }

    if (cardInBoardHaveEquipment && putEquipment) {
      throw new BadRequestException('This card already have equipment');
    }
  }

  private cardInBoardPosition(position: number, onBoard: BoardCardModel[]) {
    this.validatePosition(position);
    return onBoard.find((c) => c.position === position);
  }

  private findTokenOrFail(tokenId: string, tokens: CardTokenModel[]) {
    const found = tokens.find((t) => t.tokenId === tokenId);

    if (!found) {
      throw new BadRequestException(`Not found token with id=${tokenId}`);
    }

    return found;
  }

  private findPlayerStatusOrFail(
    userId: ObjectId | string,
    playerStatuses: PlayerStatusModel[],
  ) {
    const found = playerStatuses.find((s) => s.playerId === userId.toString());

    if (!found) {
      throw new ForbiddenException('You are not in this match');
    }

    return found;
  }

  async findByIdOrFail(id: string) {
    const match = await this.model.findById(id).exec();

    if (!match) {
      throw new NotFoundException(`Not found match with id=${id}`);
    }

    return match;
  }

  private validatePosition(position: number) {
    if (![1, 2, 3].includes(position)) {
      throw new BadRequestException('Position must in 1, 2, 3');
    }
  }

  private async createMatchTimoutJob(match: MatchDocument) {
    const timeoutJob = await this.matchQueue.add(
      MatchProcess.MATCH_TIMEOUT,
      {
        matchId: match._id.toString(),
      } as MatchTimeoutJobType,
      {
        delay: humanInterval('70 seconds'),
      },
    );

    return timeoutJob;
  }

  private async addTimoutJobToMatch(match: MatchDocument) {
    const timeoutJob = await this.createMatchTimoutJob(match);
    await this.model
      .updateOne(
        {
          _id: match._id,
        },
        {
          $set: {
            timeoutJobId: timeoutJob.id.toString(),
          },
        },
      )
      .exec();

    return await this.findByIdOrFail(match._id);
  }

  private async insertMatchTimoutJob(match: MatchDocument) {
    const timeoutJob = await this.matchQueue.add(
      MatchProcess.MATCH_TIMEOUT,
      {
        matchId: match._id.toString(),
      } as MatchTimeoutJobType,
      {
        delay: humanInterval('70 seconds'),
      },
    );

    await this.model
      .updateOne(
        {
          _id: match._id,
        },
        {
          $set: {
            timeoutJobId: timeoutJob.id.toString(),
          },
        },
      )
      .exec();
  }

  async getPlayingMatch(user: UserDocument) {
    const match = await this.matchModel
      .findOne({
        'playerStatuses.playerId': user._id.toString(),
        winner: null,
      })
      .exec();

    return match;
  }

  private async getPlayingMatchOrFail(user: UserDocument) {
    const match = await this.getPlayingMatch(user);

    if (!match) {
      throw new BadRequestException('You are not in a match');
    }

    return match;
  }
}
