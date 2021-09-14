import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auction, AuctionSchema } from './schema/auction.schema';
import { EtherClientModule } from '../ether-client/ether-client.module';
import { AuctionResolver } from './auction.resolver';
import { AuctionConsumer } from './job/auction.consumer';
import { CardModule } from '../card/card.module';

@Module({
  providers: [AuctionService, AuctionResolver, AuctionConsumer],
  imports: [
    MongooseModule.forFeature([
      {
        name: Auction.name,
        schema: AuctionSchema,
      },
    ]),
    EtherClientModule,
    CardModule,
  ],
})
export class AuctionModule {}
