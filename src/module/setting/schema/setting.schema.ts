import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema()
export class Setting {
  @Prop({ required: true })
  maxRandomValue: number;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
