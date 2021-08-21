import { IORedisOptions, PubSubModuleOptions } from '../../../lib/pub-sub';
import { cleanEnv, str } from 'envalid';
import { registerAs } from '@nestjs/config';

export type PubSubConfigType = PubSubModuleOptions;

export const getPubSubConfig = (): PubSubConfigType => {
  const env = cleanEnv(process.env, {
    REDIS_URL: str({ default: 'redis://localhost:6379' }),
  });
  const redisOptions: IORedisOptions = {
    url: env.REDIS_URL,
  };

  return {
    clientOptions: {
      pubClientOptions: redisOptions,
      subClientOptions: redisOptions,
    },
  };
};

const pubSubConfigModule = registerAs('pubSub', () => getPubSubConfig());
export default pubSubConfigModule;
