import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Match, MatchDocument } from './schema/match.schema';
import { Model } from 'mongoose';
import { PlayerTurn } from './enum/player-turn.enum';
import { User, UserDocument } from '../user/schema/user.schema';
import { DeckService } from '../deck/deck.service';
import { InjectPubSub } from '../../lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { MATCH_STARTED } from './subscription/match.trigger';

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name) private readonly model: Model<MatchDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly deckService: DeckService,
    @InjectPubSub() private readonly pubSub: RedisPubSub,
  ) {}

  async createMatch(player1Id: UserDocument, player2Id: UserDocument) {
    const player1 = await this.userModel.findById(player1Id);
    const player2 = await this.userModel.findById(player2Id);

    const firstTurn =
      Math.random() >= 0.5 ? PlayerTurn.PLAYER1 : PlayerTurn.PLAYER2;

    const player1Decks = await this.deckService.ownedDecks(player1);
    const player2Decks = await this.deckService.ownedDecks(player2);

    if (player1Decks.length < 1 || player2Decks.length < 1) {
      throw new BadRequestException('Deck must fill');
    }

    const player1Deck = player1Decks[0];
    const player2Deck = player2Decks[0];

    const player1Cards = await this.deckService.getDeckCardModels(
      player1Deck.deckCards,
    );
    const player2Cards = await this.deckService.getDeckCardModels(
      player2Deck.deckCards,
    );

    const match = new this.model({
      player1: player1._id,
      player2: player2._id,
      player1Cards,
      player2Cards,
      currentTurn: firstTurn,
    });

    await match.save();

    await this.pubSub.publish(MATCH_STARTED, {
      [MATCH_STARTED]: match.toObject(),
    });

    return match;
  }
}
