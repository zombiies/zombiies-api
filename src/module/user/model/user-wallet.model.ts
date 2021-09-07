import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserWalletModel {
  address: string;
  balance: string;
}
