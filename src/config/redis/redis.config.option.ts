import { getEnvConfig } from '../env.config';
import { registerAs } from '@nestjs/config';

type RedisConfigOption = {
  url: string;
};

export const getRedisConfig = (): RedisConfigOption => {
  const { REDIS_URL } = getEnvConfig();

  return {
    url: REDIS_URL,
  };
};

const redisConfigOption = registerAs('redis', () => getRedisConfig());
export default redisConfigOption;
