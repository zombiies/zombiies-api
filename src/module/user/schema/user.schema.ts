import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordDigest: string;

  @Prop({ required: true })
  privateKeyCipher: string;

  @Prop({ required: true, default: false })
  isVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
