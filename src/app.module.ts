import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import graphqlConfigOption from './config/graphql/graphql.config.option';
import { GraphQLModule } from '@nestjs/graphql';
import GraphqlConfigService from './config/graphql/graphql.config.service';
import { AppResolver } from './app.resolver';
import { PubSubModule } from './lib/pub-sub';
import { PubSubConfigService } from './config/pub-sub/pub-sub.config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './config/mongo/mongo.config.service';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import { CardModule } from './module/card/card.module';
import mongoConfigOption from './config/mongo/mongo.config.option';
import securityConfigOption from './config/security/security.config.option';
import { CommandModule } from 'nestjs-command';
import ipfsConfigOption from './config/ipfs/ipfs.config.option';
import { IpfsStorageModule } from './lib/ipfs-storage';
import { IpfsConfigService } from './config/ipfs/ipfs.config.service';
import ethersConfigOption from './config/ethers/ethers.config.option';
import { EthersModule } from 'nestjs-ethers';
import { EtherClientModule } from './module/ether-client/ether-client.module';
import { AuctionModule } from './module/auction/auction.module';
import { SeedCommand } from './common/command/seed.command';
import { DeckModule } from './module/deck/deck.module';
import redisConfigOption from './config/redis/redis.config.option';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { BullConfigService } from './config/bull/bull.config.service';
import { AUCTION_QUEUE } from './config/bull/queue.constant';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { Queue } from 'bull';
import { BullAdapter } from '@bull-board/api/bullAdapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        graphqlConfigOption,
        mongoConfigOption,
        securityConfigOption,
        ipfsConfigOption,
        ethersConfigOption,
        redisConfigOption,
      ],
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync({
      useClass: GraphqlConfigService,
    }),
    PubSubModule.forRootAsync({
      useClass: PubSubConfigService,
    }),
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    IpfsStorageModule.forRootAsync({
      useClass: IpfsConfigService,
    }),
    EthersModule.forRootAsync({
      providers: [ConfigService],
      inject: [ethersConfigOption.KEY],
      useFactory: (ethersConfig: ConfigType<typeof ethersConfigOption>) => {
        const { network } = ethersConfig;

        return {
          network,
        };
      },
    }),
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
    BullModule.registerQueue({
      name: AUCTION_QUEUE,
    }),
    UserModule,
    AuthModule,
    CardModule,
    CommandModule,
    EtherClientModule,
    AuctionModule,
    DeckModule,
    BullModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver, SeedCommand],
})
export class AppModule implements NestModule {
  constructor(
    @InjectQueue(AUCTION_QUEUE) private readonly auctionQueue: Queue,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();

    createBullBoard({
      queues: [new BullAdapter(this.auctionQueue)],
      serverAdapter: serverAdapter,
    });

    const bullBoardRoute = '/admin/queues';
    serverAdapter.setBasePath(bullBoardRoute);
    consumer.apply(serverAdapter.getRouter()).forRoutes(bullBoardRoute);
  }
}
