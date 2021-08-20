import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import graphqlConfigNamespace from './module/config/graphql/graphql.config.namespace';
import { GraphQLModule } from '@nestjs/graphql';
import GraphqlConfigService from './module/config/graphql/graphql.config.service';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [graphqlConfigNamespace],
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync({
      useClass: GraphqlConfigService,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
