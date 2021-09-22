import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserDocument } from '../../user/schema/user.schema';
import { DeckCardModel } from '../../deck/model/deck-card.model';
import * as mongoose from 'mongoose';
import { Board, defaultBoard } from './board.class';
import { PlayerTurn } from '../enum/player-turn.enum';

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
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: true,
  })
  player1: UserDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: true,
  })
  player2: UserDocument;

  @Prop({ default: defaultBoard })
  player1Board: Board;

  @Prop({ default: defaultBoard })
  player2Board: Board;

  @Prop()
  player1Cards: DeckCardModel[];

  @Prop()
  player2Cards: DeckCardModel[];

  @Prop({ default: 0 })
  player1Crystal: number;

  @Prop({ default: 0 })
  playerCrystal: number;

  @Prop()
  currentTurn: PlayerTurn;

  @Prop()
  timeoutJobId?: string;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
