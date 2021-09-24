import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlayerStatusModel } from '../model/player-status.model';
import { UserDocument } from '../../user/schema/user.schema';
import * as mongoose from 'mongoose';

export type MatchDocument = Match & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Match {
  @Prop()
  playerStatuses: PlayerStatusModel[];

  @Prop()
  timeoutJobId?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true,
  })
  winner?: UserDocument;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
