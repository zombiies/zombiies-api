import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserDocument } from '../../user/schema/user.schema';
import { Document } from 'mongoose';

interface BidAction {
  bid: string;
  bidderId: string;
  bidderAddress: string;
  bidAt: Date;
  transactionHash: string;
}

export type AuctionDocument = Auction & Document;

@Schema()
export class Auction {
  @Prop({ required: true, unique: true })
  tokenId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: true,
  })
  seller: UserDocument;

  @Prop({ required: true })
  sellerAddress: string;

  @Prop({ required: true })
  startBid: string;

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;

  @Prop({ required: true })
  startTransactionHash: string;

  @Prop()
  latestTransactionHash?: string;

  @Prop()
  latestBid?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true,
  })
  latestBidder?: UserDocument;

  @Prop()
  latestBidderAddress?: string;

  @Prop()
  latestBidAt?: Date;

  @Prop()
  bidHistory?: BidAction[];

  @Prop({ default: false })
  isEnded?: boolean;
}

export const AuctionSchema = SchemaFactory.createForClass(Auction);
