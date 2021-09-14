import { cleanEnv, num, str } from 'envalid';

export const getProcessEnv = () =>
  cleanEnv(process.env, {
    OWNER_PRIVATE_KEY: str(),
    CONTRACT_ADDRESS: str(),
    PRIVATE_KEY_SECRET: str(),
    ETH_NETWORK: str(),
    WEB3_STORAGE_TOKEN: str(),
    MONGO_URI: str(),
    REDIS_URL: str(),
    BCRYPT_ROUND: num(),
    JWT_SECRET: str(),
    JWT_EXPIRE_IN: str(),
  });
