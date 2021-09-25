import { registerAs } from '@nestjs/config';
import { GqlModuleOptions } from '@nestjs/graphql';
import { getNodeEnv, NodeEnvUtil } from '../../common/util';

type GraphqlConfigOption = GqlModuleOptions;

export const getGraphqlConfig = (): GraphqlConfigOption => {
  const nodeEnv = getNodeEnv();

  return {
    debug: nodeEnv === NodeEnvUtil.DEVELOPMENT,
    playground: nodeEnv === NodeEnvUtil.DEVELOPMENT,
    autoSchemaFile: true,
    subscriptions: {
      'subscriptions-transport-ws': true,
    },
    cors: true,
    introspection: nodeEnv === NodeEnvUtil.DEVELOPMENT,
  };
};

const graphqlConfigOption = registerAs('graphql', () => getGraphqlConfig());
export default graphqlConfigOption;
