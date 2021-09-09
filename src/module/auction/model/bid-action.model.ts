import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BidActionModel {
  bid: string;
  bidderId: string;
  bidderAddress: string;
  bidAt: Date;
  transactionHash: string;
}
