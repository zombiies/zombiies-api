import { Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { NotificationModel } from './model/notification.model';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { NotificationService } from './notification.service';
import { InjectPubSub } from '../../lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { NOTIFICATION_PUSHED } from './subscription/notification.trigger';
import { NotificationDocument } from './schema/notification.schema';
import { getUserFromContext } from '../../common/util';

@Resolver((of) => NotificationModel)
export class NotificationResolver {
  constructor(
    private readonly service: NotificationService,
    @InjectPubSub() private readonly pubSub: RedisPubSub,
  ) {}

  @Query((returns) => [NotificationModel])
  @UseGuards(JwtAuthGuard)
  async ownedNotifications(@CurrentUser() user: UserDocument) {
    return this.service.ownedNotifications(user);
  }

  @Subscription((returns) => NotificationModel, {
    filter: (payload: NotificationDocument, variables, context) =>
      payload[NOTIFICATION_PUSHED].owner ===
      getUserFromContext(context)?._id?.toString(),
  })
  @UseGuards(JwtAuthGuard)
  notificationPushed() {
    return this.pubSub.asyncIterator(NOTIFICATION_PUSHED);
  }

  @Mutation((returns) => String)
  @UseGuards(JwtAuthGuard)
  async pushNotification(@CurrentUser() user: UserDocument) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }

    await this.service.push(user, 'hohoho');

    return 'ok';
  }

  @Mutation((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async markAllNotificationsAsRead(@CurrentUser() user: UserDocument) {
    return this.service.markAllAsRead(user);
  }
}
