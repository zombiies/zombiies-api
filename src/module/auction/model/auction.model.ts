import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserModel } from '../../user/model/user.model';
import { BidActionModel } from './bid-action.model';
import { CardTokenModel } from '../../card/model/card-token.model';

@ObjectType()
export class AuctionModel {
  @Field((type) => ID)
  id: string;

  @Field((type) => CardTokenModel)
  token: CardTokenModel;

  @Field((type) => UserModel)
  seller: UserModel;

  sellerAddress: string;
  startBid: string;
  startAt: Date;
  endAt: Date;
  startTransactionHash: string;
  latestBid?: string;

  @Field((type) => UserModel)
  latestBidder?: UserModel;
  latestBidderAddress?: string;
  latestBidAt?: Date;
  latestTransactionHash: string;

  @Field((type) => [BidActionModel])
  bidHistory: BidActionModel[];

  isEnded?: boolean;
}
