import {
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { UserModel } from './model/user.model';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UserDocument } from './schema/user.schema';
import { UserService } from './user.service';
import { InjectPubSub } from '../../lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import withCancel from '../../common/subscription/with-cancel';
import { RoomService } from '../room/room.service';

@Resolver((of) => UserModel)
export class UserResolver {
  constructor(
    private readonly service: UserService,
    @InjectPubSub() private readonly pubSub: RedisPubSub,
    private readonly roomService: RoomService,
  ) {}

  @Query((returns) => UserModel)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() currentUser: UserDocument): UserDocument {
    return currentUser;
  }

  @ResolveField()
  async wallet(@Parent() user: UserDocument) {
    return this.service.getWalletInfoOf(user);
  }

  @Subscription((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async online(@CurrentUser() currentUser: UserDocument) {
    return withCancel(this.pubSub.asyncIterator('online'), async () => {
      await this.roomService.cleanCreatedRooms(currentUser);
    });
  }
}
