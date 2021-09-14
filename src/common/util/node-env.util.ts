import { cleanEnv, str } from 'envalid';

export enum NodeEnvUtil {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export const getNodeEnv = (): NodeEnvUtil => {
  const env = cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ['development', 'production'],
      default: 'development',
    }),
  });
  const nodeEnv = env.NODE_ENV;

  switch (nodeEnv) {
    case 'production':
      return NodeEnvUtil.PRODUCTION;
    default:
      return NodeEnvUtil.DEVELOPMENT;
  }
};

export const isDev = (): boolean => getNodeEnv() === NodeEnvUtil.DEVELOPMENT;
