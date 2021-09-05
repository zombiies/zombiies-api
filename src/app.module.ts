import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import graphqlConfigOption from './config/graphql/graphql.config.option';
import { GraphQLModule } from '@nestjs/graphql';
import GraphqlConfigService from './config/graphql/graphql.config.service';
import { AppResolver } from './app.resolver';
import { PubSubModule } from './lib/pub-sub';
import { PubSubConfigService } from './config/pub-sub/pub-sub.config.service';
import pubSubConfigOption from './config/pub-sub/pub-sub.config.option';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './config/mongo/mongo.config.service';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import { CardModule } from './module/card/card.module';
import mongoConfigOption from './config/mongo/mongo.config.option';
import securityConfigOption from './config/security/security.config.option';
import { CommandModule } from 'nestjs-command';
import ipfsConfigOption from './config/ipfs/ipfs.config.option';
import { IpfsModule } from './lib/ipfs';
import { IpfsConfigService } from './config/ipfs/ipfs.config.service';
import { SettingModule } from './module/setting/setting.module';
import ethersConfigOption from './config/ethers/ethers.config.option';
import { EthersModule } from 'nestjs-ethers';
import { EtherClientModule } from './module/ether-client/ether-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        graphqlConfigOption,
        pubSubConfigOption,
        mongoConfigOption,
        securityConfigOption,
        ipfsConfigOption,
        ethersConfigOption,
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
    IpfsModule.forRootAsync({
      useClass: IpfsConfigService,
    }),
    EthersModule.forRootAsync({
      providers: [ConfigService],
      inject: [ethersConfigOption.KEY],
      useFactory: (ethersConfig: ConfigType<typeof ethersConfigOption>) => {
        const { network, alchemyApiKey } = ethersConfig;

        return {
          network: network,
          alchemy: alchemyApiKey,
        };
      },
    }),
    UserModule,
    AuthModule,
    CardModule,
    CommandModule,
    SettingModule,
    EtherClientModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
