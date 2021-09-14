import IORedis, { Redis } from 'ioredis';
import {
  PUB_SUB_MODULE_CONNECTION,
  PUB_SUB_MODULE_CONNECTION_TOKEN,
  PUB_SUB_MODULE_OPTIONS_TOKEN,
} from './pub-sub.constant';
import { IORedisOptions, PubSubModuleOptions } from './pub-sub.interface';
import { RedisPubSub } from 'graphql-redis-subscriptions';

export const getPubSubOptionsToken = (connection: string): string => {
  return `${
    connection || PUB_SUB_MODULE_CONNECTION
  }_${PUB_SUB_MODULE_OPTIONS_TOKEN}`;
};

export const getPubSubConnectionToken = (connection: string): string => {
  return `${
    connection || PUB_SUB_MODULE_CONNECTION
  }_${PUB_SUB_MODULE_CONNECTION_TOKEN}`;
};

export const createPubSubConnection = (
  options: PubSubModuleOptions,
): RedisPubSub => {
  const { clientOptions, config } = options;

  if (config) {
    return new RedisPubSub(config);
  }

  if (!clientOptions) {
    throw new Error(
      'Invalid configuration. Must provider one of clientOptions, env!',
    );
  }

  const { pubClientOptions, subClientOptions } = clientOptions;

  return new RedisPubSub({
    publisher: createRedisConnection(pubClientOptions),
    subscriber: createRedisConnection(subClientOptions),
  });
};

const createRedisConnection = (options: IORedisOptions): Redis => {
  const { url, ...config } = options;

  if (options.url) {
    return new IORedis(url, config);
  }

  return new IORedis(config);
};
