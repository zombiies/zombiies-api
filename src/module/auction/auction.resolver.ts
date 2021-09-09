import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuctionModel } from './model/auction.model';
import { AuctionService } from './auction.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { StartAuctionInput } from './input/start-auction.input';
import { BigNumber } from 'ethers';
import { parseEther } from 'nestjs-ethers';
import { BidInput } from './input/bid.input';
import { EndAuctionInput } from './input/end-auction.input';

@Resolver((of) => AuctionModel)
export class AuctionResolver {
  constructor(private readonly service: AuctionService) {}

  @Mutation((returns) => AuctionModel)
  @UseGuards(JwtAuthGuard)
  async startAuction(
    @CurrentUser() currentUser: UserDocument,
    @Args('input') input: StartAuctionInput,
  ) {
    const { tokenId, startBid } = input;

    return this.service.startAuction(
      currentUser,
      BigNumber.from(tokenId),
      parseEther(startBid),
    );
  }

  @Mutation((returns) => AuctionModel)
  @UseGuards(JwtAuthGuard)
  async endAuction(
    @CurrentUser() currentUser: UserDocument,
    @Args('input') input: EndAuctionInput,
  ) {
    const { auctionId } = input;

    return this.service.endAuction(currentUser, auctionId);
  }

  @Mutation((returns) => AuctionModel)
  @UseGuards(JwtAuthGuard)
  async bid(
    @CurrentUser() currentUser: UserDocument,
    @Args('input') input: BidInput,
  ) {
    const { auctionId, bid } = input;

    return this.service.bid(currentUser, auctionId, parseEther(bid));
  }

  @Query((returns) => [AuctionModel])
  async allAuctions() {
    return this.service.allAuctions();
  }

  @Query((returns) => [AuctionModel])
  @UseGuards(JwtAuthGuard)
  async ownedAuctions(@CurrentUser() currentUser: UserDocument) {
    return this.service.ownedAuctions(currentUser);
  }

  @Query((returns) => [AuctionModel])
  @UseGuards(JwtAuthGuard)
  async participatedAuctions(@CurrentUser() currentUser: UserDocument) {
    return this.service.participatedAuctions(currentUser);
  }
}
