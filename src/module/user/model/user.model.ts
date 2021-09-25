import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserWalletModel } from './user-wallet.model';

@ObjectType()
export class UserModel {
  @Field((type) => ID)
  id: string;

  username: string;
  email: string;
  isVerified: boolean;

  wallet: UserWalletModel;
}
