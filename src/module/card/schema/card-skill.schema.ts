import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CardSkillType {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  MAGIC = 'MAGIC',
  RANDOM = 'RANDOM',
  HP = 'HP',
  ARMOR = 'ARMOR',
}

export type CardSkillDocument = CardSkill & Document;

@Schema()
export class CardSkill {
  @Prop({ required: true, enum: CardSkillType })
  type: CardSkillType;

  @Prop({ required: true })
  value: number;
}

export const CardSkillSchema = SchemaFactory.createForClass(CardSkill);
