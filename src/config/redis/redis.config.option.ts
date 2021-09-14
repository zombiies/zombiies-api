import { registerAs } from '@nestjs/config';
import { getProcessEnv } from '../../common/env/process.env';

type RedisConfigOption = {
  url: string;
};

export const getRedisConfig = (): RedisConfigOption => {
  const { REDIS_URL } = getProcessEnv();

  return {
    url: REDIS_URL,
  };
};

const redisConfigOption = registerAs('redis', () => getRedisConfig());
export default redisConfigOption;
