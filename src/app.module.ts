import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import graphqlConfigModule from './module/config/graphql/graphql.config.module';
import { GraphQLModule } from '@nestjs/graphql';
import GraphqlConfigService from './module/config/graphql/graphql.config.service';
import { AppResolver } from './app.resolver';
import { PubSubModule } from './lib/pub-sub';
import { PubSubConfigService } from './module/config/pub-sub/pub-sub.config.service';
import pubSubConfigModule from './module/config/pub-sub/pub-sub.config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [graphqlConfigModule, pubSubConfigModule],
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync({
      useClass: GraphqlConfigService,
    }),
    PubSubModule.forRootAsync({
      useClass: PubSubConfigService,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
