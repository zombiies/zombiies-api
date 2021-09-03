import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { CardLevel } from './card-level.schema';

export enum RareLevel {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  ELITE = 'ELITE',
}

export enum Faction {
  CHAOS = 'CHAOS',
  NATURE = 'NATURE',
  BALANCE = 'BALANCE',
  FORTUNE = 'FORTUNE',
  WAR = 'WAR',
  NEUTRAL = 'NEUTRAL',
}

export enum CardType {
  MONSTER = 'MONSTER',
  EQUIPMENT = 'EQUIPMENT',
}

export type CardDocument = Card & Document;

@Schema()
export class Card {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  cost: number;

  @Prop({ required: true, enum: RareLevel })
  rareLevel: RareLevel;

  @Prop({ required: true, enum: Faction })
  faction: Faction;

  @Prop({ required: true, enum: CardType })
  type: CardType;

  @Prop({ required: true, unique: true })
  ipfsUri: string;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CardLevel',
        autopopulate: true,
      },
    ],
  })
  levels: CardLevel[];
}

export const CardSchema = SchemaFactory.createForClass(Card);
