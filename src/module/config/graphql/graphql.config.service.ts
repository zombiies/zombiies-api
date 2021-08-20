import { Inject, Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import graphqlConfigNamespace from './graphql.config.namespace';
import { ConfigType } from '@nestjs/config';

@Injectable()
export default class GraphqlConfigService implements GqlOptionsFactory {
  constructor(
    @Inject(graphqlConfigNamespace.KEY)
    private readonly gqlConfig: ConfigType<typeof graphqlConfigNamespace>,
  ) {}

  createGqlOptions(): Promise<GqlModuleOptions> | GqlModuleOptions {
    return this.gqlConfig;
  }
}
