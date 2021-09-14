import { Injectable } from '@nestjs/common';
import { InjectPubSub } from '../../lib/pub-sub';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { UserDocument } from '../user/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  Notification,
  NotificationDocument,
} from './schema/notification.schema';
import { Model } from 'mongoose';
import { NOTIFICATION_PUSHED } from './subscription/notification.trigger';

@Injectable()
export class NotificationService {
  constructor(
    @InjectPubSub() private readonly pubSub: RedisPubSub,
    @InjectModel(Notification.name)
    private readonly model: Model<NotificationDocument>,
  ) {}

  async push(user: UserDocument, content: string) {
    const notification = new this.model({
      owner: user.id,
      content,
    });
    await notification.save();

    await this.pubSub.publish(NOTIFICATION_PUSHED, {
      [NOTIFICATION_PUSHED]: notification,
    });
  }

  async ownedNotifications(user: UserDocument) {
    return this.model
      .find({
        owner: user._id,
      })
      .exec();
  }

  async markAllAsRead(user: UserDocument) {
    await this.model
      .updateMany(
        {
          owner: user._id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        },
      )
      .exec();

    return true;
  }
}
