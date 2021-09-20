import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserDocument } from '../../user/schema/user.schema';
import * as mongoose from 'mongoose';
import { MongoTimestamp } from '../../../common/type/mongo-timestamp.type';

export type NotificationDocument = Notification & Document & MongoTimestamp;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Notification {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  owner: UserDocument;

  @Prop()
  content: string;

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
