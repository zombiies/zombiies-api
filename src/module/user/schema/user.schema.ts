import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../enum/user-role.enum';

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
  isVerified?: boolean;

  @Prop({ required: true, default: UserRole.USER })
  role?: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
