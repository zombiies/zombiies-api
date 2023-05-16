import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlayerStatusModel } from '../model/player-status.model';
import { MongoTimestamp } from '../../../common/type/mongo-timestamp.type';

export type MatchDocument = Match & Document & MongoTimestamp;

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

  @Prop()
  winnerId?: string;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
