import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Auction, AuctionDocument } from './schema/auction.schema';
import { Model } from 'mongoose';
import { EtherClientService } from '../ether-client/ether-client.service';
import { UserDocument } from '../user/schema/user.schema';
import { BigNumber } from 'ethers';
import { addDays, isAfter, isBefore } from 'date-fns';
import { formatEther, parseEther } from 'nestjs-ethers';
import { isNotAdmin } from '../user/user.util';

@Injectable()
export class AuctionService {
  constructor(
    @InjectModel(Auction.name)
    private readonly auctionModel: Model<AuctionDocument>,
    private readonly ethClient: EtherClientService,
  ) {}

  get contract() {
    return this.ethClient.contract;
  }

  get ownerWallet() {
    return this.ethClient.ownerWallet;
  }

  async allAuctions() {
    return this.auctionModel.find().exec();
  }

  async ownedAuctions(user: UserDocument) {
    return this.auctionModel
      .find({
        seller: user._id,
      })
      .exec();
  }

  async participatedAuctions(user: UserDocument) {
    return this.auctionModel
      .find({
        'bidHistory.bidderId': user._id,
      })
      .exec();
  }

  async bid(bidder: UserDocument, auctionId: string, currentBid: BigNumber) {
    const currentBidAt = new Date();

    const auction = await this.auctionModel.findById(auctionId).exec();

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const {
      startBid,
      latestBid,
      endAt,
      latestBidderAddress,
      latestBidder,
      latestBidAt,
      latestTransactionHash,
      bidHistory,
      isEnded,
    } = auction;

    if (isEnded || isAfter(currentBidAt, endAt)) {
      throw new BadRequestException('Auction has ended');
    }

    const latestBidNum = parseEther(latestBid || startBid);

    if (currentBid.lte(latestBidNum)) {
      throw new BadRequestException('New bid must be greater than old bid');
    }

    const bidderWallet = this.ethClient.getWalletOfUser(bidder);

    const tx = await bidderWallet.sendTransaction({
      to: this.ownerWallet.address,
      value: currentBid,
    });
    const receipt = await tx.wait();
    const currentTransactionHash = receipt.transactionHash;

    if (latestBid) {
      // Refund to old bidder
      try {
        await (
          await this.ownerWallet.sendTransaction({
            to: latestBidderAddress,
            value: parseEther(latestBid),
          })
        ).wait();
      } catch (e) {
        await (
          await this.ownerWallet.sendTransaction({
            to: bidderWallet.address,
            value: currentBid,
          })
        ).wait();
        throw e;
      }
    }

    try {
      await this.auctionModel
        .updateOne(
          {
            _id: auction._id,
          },
          {
            $set: {
              latestBid: formatEther(currentBid),
              latestBidAt: currentBidAt,
              latestBidder: bidder._id,
              latestTransactionHash: currentTransactionHash,
              latestBidderAddress: bidderWallet.address,
              bidHistory: [
                ...(bidHistory || []),
                ...(latestBidder
                  ? [
                      {
                        bid: latestBid,
                        bidAt: latestBidAt,
                        bidderAddress: latestBidderAddress,
                        bidderId: latestBidder._id,
                        transactionHash: latestTransactionHash,
                      },
                    ]
                  : []),
              ],
            },
          },
        )
        .exec();
    } catch (e) {
      await (
        await this.ownerWallet.sendTransaction({
          to: bidderWallet.address,
          value: currentBid,
        })
      ).wait;

      throw e;
    }

    return this.auctionModel.findById(auction._id).exec();
  }

  async endAuction(user: UserDocument, auctionId: string) {
    const current = new Date();

    const auction = await this.auctionModel.findById(auctionId).exec();

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const {
      seller,
      sellerAddress,
      latestBid,
      latestBidder,
      tokenId,
      latestBidderAddress,
      isEnded,
      endAt,
    } = auction;

    if (
      seller._id !== user._id &&
      latestBidder._id !== user._id &&
      isNotAdmin(user)
    ) {
      throw new ForbiddenException(
        'You do not have permission to end this auction',
      );
    }

    if (isEnded) {
      throw new BadRequestException('Auction is ended');
    }

    if (isBefore(current, endAt) && isNotAdmin(user)) {
      throw new BadRequestException('Can not end auction at this time');
    }

    if (latestBid) {
      const bid = parseEther(latestBid);
      const tax = bid.div(5);

      const tx = await this.ownerWallet.sendTransaction({
        to: sellerAddress,
        value: bid.sub(tax),
      });
      await tx.wait();

      const sendTokenTx = await this.contract[
        'safeTransferFrom(address,address,uint256)'
      ](this.ownerWallet.address, latestBidderAddress, BigNumber.from(tokenId));
      await sendTokenTx.wait();
    } else {
      const tx = await this.contract[
        'safeTransferFrom(address,address,uint256)'
      ](this.ownerWallet.address, sellerAddress, BigNumber.from(tokenId));
      await tx.wait();
    }

    await this.auctionModel
      .updateOne(
        {
          _id: auctionId,
        },
        {
          $set: {
            isEnded: true,
          },
        },
      )
      .exec();

    return this.auctionModel.findById(auctionId).exec();
  }

  async startAuction(
    seller: UserDocument,
    tokenId: BigNumber,
    startBid: BigNumber,
  ) {
    const sellerWallet = this.ethClient.getWalletOfUser(seller);

    if (!(await this.ethClient.isOwnerOf(sellerWallet.address, tokenId))) {
      throw new ForbiddenException('You do not owned this token');
    }

    const dealTx = await this.contract
      .connect(sellerWallet)
      ['safeTransferFrom(address,address,uint256)'](
        sellerWallet.address,
        this.ownerWallet.address,
        tokenId,
      );
    const dealReceipt = await dealTx.wait();
    const dealHash = dealReceipt.transactionHash;
    const startAt = new Date();

    try {
      const auction = new this.auctionModel({
        tokenId: tokenId.toHexString(),
        seller: seller._id,
        sellerAddress: sellerWallet.address,
        startBid: formatEther(startBid),
        startAt,
        endAt: addDays(startAt, 1),
        startTransactionHash: dealHash,
      });

      return auction.save();
    } catch (e) {
      await (
        await this.contract['safeTransferFrom(address,address,uint256)'](
          this.ownerWallet.address,
          sellerWallet.address,
          tokenId,
        )
      ).wait();

      throw e;
    }
  }
}
