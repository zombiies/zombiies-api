import { registerAs } from '@nestjs/config';
import { GqlModuleOptions } from '@nestjs/graphql';
import { getNodeEnv, NodeEnv } from '../../../util/node-env';

export type GraphqlConfigType = GqlModuleOptions;

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

const graphqlConfigModule = registerAs('graphql', () => getGraphqlConfig());
export default graphqlConfigModule;
