import { registerAs } from '@nestjs/config';
import { GqlModuleOptions } from '@nestjs/graphql';
import { getNodeEnv, NodeEnv } from '../../util/node-env';

type GraphqlConfigOption = GqlModuleOptions;

export const getGraphqlConfig = (): GraphqlConfigOption => {
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

const graphqlConfigOption = registerAs('graphql', () => getGraphqlConfig());
export default graphqlConfigOption;
