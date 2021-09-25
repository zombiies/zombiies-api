import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserModel } from '../../user/model/user.model';
import { BidActionModel } from './bid-action.model';
import { CardTokenModel } from '../../card/model/card-token.model';

@ObjectType()
export class AuctionModel {
  @Field((type) => ID)
  id: string;

  token: CardTokenModel;

  seller: UserModel;

  sellerAddress: string;
  startBid: string;
  startAt: Date;
  endAt: Date;
  startTransactionHash: string;
  latestBid?: string;

  latestBidder?: UserModel;
  latestBidderAddress?: string;
  latestBidAt?: Date;
  latestTransactionHash: string;

  bidHistory: BidActionModel[];

  isEnded?: boolean;
}
