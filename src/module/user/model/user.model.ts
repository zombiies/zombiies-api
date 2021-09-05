import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
  @Field((type) => ID)
  id: string;

  username: string;
  email: string;
  isVerified: boolean;
  walletAddress: string;
  walletBalance: string;
}
