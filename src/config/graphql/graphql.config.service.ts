import { Inject, Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import { ConfigType } from '@nestjs/config';
import graphqlConfigOption from './graphql.config.option';
import { isDev, lowerMapKey } from '../../common/util';

@Injectable()
export default class GraphqlConfigService implements GqlOptionsFactory {
  constructor(
    @Inject(graphqlConfigOption.KEY)
    private readonly gqlConfig: ConfigType<typeof graphqlConfigOption>,
  ) {}

  createGqlOptions(): Promise<GqlModuleOptions> | GqlModuleOptions {
    return {
      ...this.gqlConfig,
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: async (connectionParams) => {
            if (isDev()) {
              console.log(connectionParams);
            }

            const lowerKeyParams = lowerMapKey(connectionParams);
            const { authorization } = lowerKeyParams;

            if (authorization) {
              return {
                req: {
                  headers: lowerKeyParams,
                },
              };
            }

            return connectionParams;
          },
        },
      },
    };
  }
}
