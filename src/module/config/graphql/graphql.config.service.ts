import { Inject, Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import { ConfigType } from '@nestjs/config';
import graphqlConfigModule from './graphql.config.module';

@Injectable()
export default class GraphqlConfigService implements GqlOptionsFactory {
  constructor(
    @Inject(graphqlConfigModule.KEY)
    private readonly gqlConfig: ConfigType<typeof graphqlConfigModule>,
  ) {}

  createGqlOptions(): Promise<GqlModuleOptions> | GqlModuleOptions {
    return this.gqlConfig;
  }
}
