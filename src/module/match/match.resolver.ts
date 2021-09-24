import { Args, Int, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { MatchModel } from './model/match.model';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { InjectPubSub } from '../../lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import {
  CONFIRM_TURN_EVENT,
  MATCH_ENDED,
  MATCH_STARTED,
  PREPARE_TURN_EVENT,
  REWARD_RECEIVED,
} from './subscription/match.trigger';
import { getUserFromContext } from '../../common/util';
import { PlayerStatusModel } from './model/player-status.model';
import { PrepareTurnEventModel } from './model/prepare-turn-event.model';
import { ConfirmTurnEventModel } from './model/confirm-turn-event.model';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { MatchService } from './match.service';
import { RewardModel } from './model/reward.model';

const matchFilter = (trigger: string) => (payload, variables, context) =>
  (payload[trigger] as MatchModel).playerStatuses.some(
    (s: PlayerStatusModel) =>
      s.playerId === getUserFromContext(context)?._id?.toString(),
  );

@Resolver((of) => MatchModel)
export class MatchResolver {
  constructor(
    @InjectPubSub() private readonly pubSub: RedisPubSub,
    private readonly service: MatchService,
  ) {}

  @Subscription((returns) => MatchModel, {
    filter: matchFilter(MATCH_STARTED),
  })
  @UseGuards(JwtAuthGuard)
  async matchStarted() {
    return this.pubSub.asyncIterator(MATCH_STARTED);
  }

  @Subscription((returns) => PrepareTurnEventModel, {
    filter: (payload, variables, context) =>
      (
        payload[PREPARE_TURN_EVENT] as PrepareTurnEventModel
      ).currentMatchStatus.playerStatuses.some(
        (s: PlayerStatusModel) =>
          s.playerId === getUserFromContext(context)?._id?.toString(),
      ),
  })
  @UseGuards(JwtAuthGuard)
  async prepareTurnEvent() {
    return this.pubSub.asyncIterator(PREPARE_TURN_EVENT);
  }

  @Subscription((returns) => MatchModel, {
    filter: matchFilter(MATCH_ENDED),
  })
  @UseGuards(JwtAuthGuard)
  async matchEnded() {
    return this.pubSub.asyncIterator(MATCH_ENDED);
  }

  @Subscription((returns) => ConfirmTurnEventModel, {
    filter: (payload, variables, context) =>
      (
        payload[CONFIRM_TURN_EVENT] as ConfirmTurnEventModel
      ).currentMatchStatus.playerStatuses.some(
        (s: PlayerStatusModel) =>
          s.playerId === getUserFromContext(context)?._id?.toString(),
      ),
  })
  @UseGuards(JwtAuthGuard)
  async confirmTurnEvent() {
    return this.pubSub.asyncIterator(CONFIRM_TURN_EVENT);
  }

  @Subscription((returns) => RewardModel, {
    filter: (payload, variables, context) =>
      (payload[REWARD_RECEIVED] as RewardModel).playerId ===
      getUserFromContext(context)?._id?.toString(),
  })
  @UseGuards(JwtAuthGuard)
  async rewardReceived() {
    return this.pubSub.asyncIterator(REWARD_RECEIVED);
  }

  @Mutation((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async putCardToBoard(
    @CurrentUser() user: UserDocument,
    @Args('tokenId', { type: () => String }) tokenId: string,
    @Args('position', { type: () => Int }) position: number,
  ) {
    await this.service.putToBoard(user, tokenId, position);

    return true;
  }

  @Mutation((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async denyCard(
    @CurrentUser() user: UserDocument,
    @Args('tokenId', { type: () => String }) tokenId: string,
  ) {
    await this.service.denyCard(user, tokenId);

    return true;
  }

  @Mutation((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async confirmTurn(@CurrentUser() user: UserDocument) {
    await this.service.confirmTurn(user);

    return true;
  }

  @Mutation((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async endTurn(@CurrentUser() user: UserDocument) {
    await this.service.endTurn(user);

    return true;
  }

  @Mutation((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async surrender(@CurrentUser() user: UserDocument) {
    await this.service.surrender(user);

    return true;
  }
}
