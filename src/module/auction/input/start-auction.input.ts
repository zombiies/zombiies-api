import { InputType } from '@nestjs/graphql';

@InputType()
export class StartAuctionInput {
  tokenId: string;
  startBid: string;
}
