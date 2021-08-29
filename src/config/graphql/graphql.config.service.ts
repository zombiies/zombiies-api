import { Inject, Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import { ConfigType } from '@nestjs/config';
import graphqlConfigOption from './graphql.config.option';

@Injectable()
export default class GraphqlConfigService implements GqlOptionsFactory {
  constructor(
    @Inject(graphqlConfigOption.KEY)
    private readonly gqlConfig: ConfigType<typeof graphqlConfigOption>,
  ) {}

  createGqlOptions(): Promise<GqlModuleOptions> | GqlModuleOptions {
    return this.gqlConfig;
  }
}
