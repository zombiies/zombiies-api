import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auction, AuctionSchema } from './schema/auction.schema';
import { EtherClientModule } from '../ether-client/ether-client.module';
import { AuctionResolver } from './auction.resolver';
import { CardModule } from '../card/card.module';
import { NotificationModule } from '../notification/notification.module';
import { BullModule } from '@nestjs/bull';
import { AUCTION_QUEUE } from '../../config/bull/queue.constant';
import { AuctionConsumer } from './consumer/auction.consumer';

@Module({
  providers: [AuctionService, AuctionResolver, AuctionConsumer],
  imports: [
    MongooseModule.forFeature([
      {
        name: Auction.name,
        schema: AuctionSchema,
      },
    ]),
    BullModule.registerQueue({
      name: AUCTION_QUEUE,
    }),
    EtherClientModule,
    CardModule,
    NotificationModule,
  ],
})
export class AuctionModule {}
