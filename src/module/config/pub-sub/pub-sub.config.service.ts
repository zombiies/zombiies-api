import { Inject, Injectable } from '@nestjs/common';
import {
  PubSubModuleOptions,
  PubSubModuleOptionsFactory,
} from '../../../lib/pub-sub';
import pubSubConfigModule from './pub-sub.config.module';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class PubSubConfigService implements PubSubModuleOptionsFactory {
  constructor(
    @Inject(pubSubConfigModule.KEY)
    private readonly pubSubConfig: ConfigType<typeof pubSubConfigModule>,
  ) {}

  createPubSubModuleOptions():
    | Promise<PubSubModuleOptions>
    | PubSubModuleOptions {
    return this.pubSubConfig;
  }
}
