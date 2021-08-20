export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export const getNodeEnv = (): NodeEnv => {
  const nodeEnv = process.env['NODE_ENV'] || 'development';

  switch (nodeEnv) {
    case 'production':
      return NodeEnv.PRODUCTION;
    default:
      return NodeEnv.DEVELOPMENT;
  }
};
