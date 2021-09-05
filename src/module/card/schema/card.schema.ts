import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RareLevel } from '../enum/rare-level.enum';
import { Faction } from '../enum/faction.enum';
import { CardType } from '../enum/card-type.enum';
import { CardSkillType } from '../enum/card-skill-type.enum';

export type CardSkill = {
  type: CardSkillType;
  value: number;
};

export type CardLevel = {
  level: number;
  skills: CardSkill[];
};

export type CardDocument = Card & Document;

@Schema()
export class Card {
  @Prop({ required: true })
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
  cid: string;

  @Prop({ required: true })
  levels: CardLevel[];

  @Prop({ required: true })
  startSeed: number;

  @Prop({ required: true })
  endSeed: number;

  @Prop({ required: true })
  totalSeeds: number;
}

export const CardSchema = SchemaFactory.createForClass(Card);
