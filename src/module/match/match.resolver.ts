import { Resolver, Subscription } from '@nestjs/graphql';
import { MatchModel } from './model/match.model';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { InjectPubSub } from '../../lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { MATCH_STARTED } from './subscription/match.trigger';
import { getUserFromContext } from '../../common/util';

@Resolver((of) => MatchModel)
export class MatchResolver {
  constructor(@InjectPubSub() private readonly pubSub: RedisPubSub) {}

  @Subscription((returns) => MatchModel, {
    filter: (payload, variables, context) =>
      payload[MATCH_STARTED].player1._id.toString() ===
        getUserFromContext(context)?._id?.toString() ||
      payload[MATCH_STARTED].player2._id.toString() ===
        getUserFromContext(context)?._id?.toString(),
  })
  @UseGuards(JwtAuthGuard)
  async matchStarted() {
    return this.pubSub.asyncIterator(MATCH_STARTED);
  }
}
