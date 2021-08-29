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
import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import mongoConfigOption from './config/mongo/mongo.config.option';
import securityConfigOption from './config/security/security.config.option';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        graphqlConfigOption,
        pubSubConfigOption,
        mongoConfigOption,
        securityConfigOption,
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
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
