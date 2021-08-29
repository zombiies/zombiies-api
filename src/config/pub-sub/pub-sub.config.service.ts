import { Inject, Injectable } from '@nestjs/common';
import {
  PubSubModuleOptions,
  PubSubModuleOptionsFactory,
} from '../../lib/pub-sub';
import pubSubConfigOption from './pub-sub.config.option';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class PubSubConfigService implements PubSubModuleOptionsFactory {
  constructor(
    @Inject(pubSubConfigOption.KEY)
    private readonly pubSubConfig: ConfigType<typeof pubSubConfigOption>,
  ) {}

  createPubSubModuleOptions():
    | Promise<PubSubModuleOptions>
    | PubSubModuleOptions {
    return this.pubSubConfig;
  }
}
