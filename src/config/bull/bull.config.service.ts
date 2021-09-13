import { Inject, Injectable } from '@nestjs/common';
import { SharedBullConfigurationFactory } from '@nestjs/bull';
import Bull from 'bull';
import redisConfigOption from '../redis/redis.config.option';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(
    @Inject(redisConfigOption.KEY)
    private readonly redisConfig: ConfigType<typeof redisConfigOption>,
  ) {}

  createSharedConfiguration(): Promise<Bull.QueueOptions> | Bull.QueueOptions {
    const { url } = this.redisConfig;

    return {
      redis: url,
    };
  }
}
