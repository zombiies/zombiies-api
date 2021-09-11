import { cleanEnv, str } from 'envalid';

export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export const getNodeEnv = (): NodeEnv => {
  const env = cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ['development', 'production'],
      default: 'development',
    }),
  });
  const nodeEnv = env.NODE_ENV;

  switch (nodeEnv) {
    case 'production':
      return NodeEnv.PRODUCTION;
    default:
      return NodeEnv.DEVELOPMENT;
  }
};

export const isDev = (): boolean => getNodeEnv() === NodeEnv.DEVELOPMENT;
