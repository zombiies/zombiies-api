import { registerAs } from '@nestjs/config';
import { GqlModuleOptions } from '@nestjs/graphql';
import { getNodeEnv, NodeEnv } from '../../../util/node-env';

export type GraphqlConfigType = GqlModuleOptions;
export const GRAPHQL_CONFIG_NAME = 'graphql';

export const getGraphqlConfig = (): GraphqlConfigType => {
  const nodeEnv = getNodeEnv();

  return {
    debug: nodeEnv === NodeEnv.DEVELOPMENT,
    playground: nodeEnv === NodeEnv.DEVELOPMENT,
    autoSchemaFile: true,
    installSubscriptionHandlers: true,
    cors: true,
    introspection: nodeEnv === NodeEnv.DEVELOPMENT,
  };
};

const graphqlConfigNamespace = registerAs(GRAPHQL_CONFIG_NAME, () =>
  getGraphqlConfig(),
);
export default graphqlConfigNamespace;
