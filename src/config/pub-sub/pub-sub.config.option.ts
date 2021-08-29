import { IORedisOptions, PubSubModuleOptions } from '../../lib/pub-sub';
import { cleanEnv, str } from 'envalid';
import { registerAs } from '@nestjs/config';

type PubSubConfigOption = PubSubModuleOptions;

export const getPubSubConfig = (): PubSubConfigOption => {
  const env = cleanEnv(process.env, {
    REDIS_URL: str(),
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

const pubSubConfigOption = registerAs('pubSub', () => getPubSubConfig());
export default pubSubConfigOption;
