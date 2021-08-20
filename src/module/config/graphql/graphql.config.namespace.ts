import { registerAs } from '@nestjs/config';
import { GqlModuleOptions } from '@nestjs/graphql';

export type GraphqlConfigType = GqlModuleOptions;
export const GRAPHQL_CONFIG_NAME = 'graphql';

export const getGraphqlConfig = (): GraphqlConfigType => {
  const env = process.env['ENV'] || 'development';

  return {
    debug: env === 'development',
    playground: env === 'development',
    autoSchemaFile: true,
    installSubscriptionHandlers: true,
  };
};

const graphqlConfigNamespace = registerAs(GRAPHQL_CONFIG_NAME, () =>
  getGraphqlConfig(),
);
export default graphqlConfigNamespace;
