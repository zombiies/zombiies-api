import { Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { RoomModel } from './model/room.model';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { InjectPubSub } from '../../lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { RoomService } from './room.service';
import {
  ALL_READY,
  READY_TIMEOUT,
  WAIT_READY,
} from './subscription/room-subscription.trigger';
import { getUserFromContext } from '../../common/util';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UserDocument } from '../user/schema/user.schema';

const getFilterCallback = (trigger: string) => (payload, variables, context) =>
  payload[trigger].player1.toString() ===
    getUserFromContext(context)?._id?.toString() ||
  payload[trigger].player2?.toString() ===
    getUserFromContext(context)?._id?.toString();

@Resolver((of) => RoomModel)
export class RoomResolver {
  constructor(
    @InjectPubSub() private readonly pubSub: RedisPubSub,
    private readonly service: RoomService,
  ) {}

  @Mutation((returns) => RoomModel)
  @UseGuards(JwtAuthGuard)
  async findMatch(@CurrentUser() user: UserDocument) {
    return this.service.joinOrCreateRoom(user);
  }

  @Mutation((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async stopFindMatch(@CurrentUser() user: UserDocument) {
    return this.service.stopFindMatch(user);
  }

  @Mutation((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async ready(@CurrentUser() user: UserDocument) {
    return this.service.ready(user);
  }

  @Subscription((returns) => RoomModel, {
    filter: getFilterCallback(ALL_READY),
  })
  @UseGuards(JwtAuthGuard)
  async onAllReady() {
    return this.pubSub.asyncIterator(ALL_READY);
  }

  @Subscription((returns) => RoomModel, {
    filter: getFilterCallback(READY_TIMEOUT),
  })
  @UseGuards(JwtAuthGuard)
  async onReadyTimeout() {
    return this.pubSub.asyncIterator(READY_TIMEOUT);
  }

  @Subscription((returns) => RoomModel, {
    filter: getFilterCallback(WAIT_READY),
  })
  @UseGuards(JwtAuthGuard)
  async onWaitForReady() {
    return this.pubSub.asyncIterator(WAIT_READY);
  }
}
