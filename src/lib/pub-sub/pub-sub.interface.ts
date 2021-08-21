import { PubSubRedisOptions } from 'graphql-redis-subscriptions/dist/redis-pubsub';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { RedisOptions } from 'ioredis';

export type IORedisOptions = RedisOptions & {
  url?: string;
};

export type PubSubModuleOptions = {
  clientOptions?: {
    pubClientOptions: IORedisOptions;
    subClientOptions: IORedisOptions;
  };
  config?: PubSubRedisOptions;
};

export interface PubSubModuleOptionsFactory {
  createPubSubModuleOptions():
    | Promise<PubSubModuleOptions>
    | PubSubModuleOptions;
}

export interface PubSubModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<PubSubModuleOptionsFactory>;
  useExisting?: Type<PubSubModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<PubSubModuleOptions> | PubSubModuleOptions;
}
