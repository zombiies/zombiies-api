import { Inject, Injectable } from '@nestjs/common';
import {
  PubSubModuleOptions,
  PubSubModuleOptionsFactory,
} from '../../lib/pub-sub';
import { ConfigType } from '@nestjs/config';
import redisConfigOption from '../redis/redis.config.option';

@Injectable()
export class PubSubConfigService implements PubSubModuleOptionsFactory {
  constructor(
    @Inject(redisConfigOption.KEY)
    private readonly redisConfig: ConfigType<typeof redisConfigOption>,
  ) {}

  createPubSubModuleOptions():
    | Promise<PubSubModuleOptions>
    | PubSubModuleOptions {
    return {
      clientOptions: {
        pubClientOptions: this.redisConfig,
        subClientOptions: this.redisConfig,
      },
    };
  }
}
