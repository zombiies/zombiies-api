import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RareLevel } from '../enum/rare-level.enum';
import { Faction } from '../enum/faction.enum';
import { CardType } from '../enum/card-type.enum';
import { CardSkillModel } from '../model/card-skill.model';

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
  tokenUri: string;

  @Prop({ required: true })
  level: number;

  @Prop({ required: true })
  skills: CardSkillModel[];

  @Prop({ required: true })
  startSeed: number;

  @Prop({ required: true })
  endSeed: number;

  @Prop({ required: true })
  totalSeeds: number;
}

export const CardSchema = SchemaFactory.createForClass(Card);
