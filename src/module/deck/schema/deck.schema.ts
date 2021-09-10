import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserDocument } from '../../user/schema/user.schema';
import { Document } from 'mongoose';

export type DeckCard = {
  position: number;
  tokenId: string;
};

export type DeckDocument = Deck & Document;

@Schema()
export class Deck {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true,
  })
  owner: UserDocument;

  @Prop()
  deckCards: DeckCard[];
}

export const DeckSchema = SchemaFactory.createForClass(Deck);
