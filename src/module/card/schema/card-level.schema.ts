import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CardSkill } from './card-skill.schema';
import * as mongoose from 'mongoose';

export type CardLevelDocument = CardLevel & Document;

@Schema()
export class CardLevel {
  @Prop({ required: true })
  level: number;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CardSkill',
        autopopulate: true,
      },
    ],
  })
  skills: CardSkill[];
}

export const CardLevelSchema = SchemaFactory.createForClass(CardLevel);
