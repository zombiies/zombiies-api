import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import graphqlConfigOption from './config/graphql/graphql.config.option';
import { GraphQLModule } from '@nestjs/graphql';
import GraphqlConfigService from './config/graphql/graphql.config.service';
import { AppResolver } from './app.resolver';
import { PubSubModule } from './lib/pub-sub';
import { PubSubConfigService } from './config/pub-sub/pub-sub.config.service';
import pubSubConfigOption from './config/pub-sub/pub-sub.config.option';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './config/mongo/mongo.config.service';
import mongoConfigOption from './config/mongo/mongo.config.option';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [graphqlConfigOption, pubSubConfigOption, mongoConfigOption],
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
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
