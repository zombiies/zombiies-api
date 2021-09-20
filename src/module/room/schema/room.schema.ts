import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserDocument } from '../../user/schema/user.schema';
import * as mongoose from 'mongoose';

export type RoomDocument = Room & Document;

@Schema({
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
})
export class Room {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  player1: UserDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  player2?: UserDocument;

  @Prop()
  player1Ready?: boolean;

  @Prop()
  player2Ready?: boolean;

  @Prop()
  timeoutJobId?: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
