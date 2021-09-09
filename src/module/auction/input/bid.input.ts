import { InputType } from '@nestjs/graphql';

@InputType()
export class BidInput {
  auctionId: string;
  bid: string;
}
