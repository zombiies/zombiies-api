import { Inject, Injectable } from '@nestjs/common';
import {
  PinataModuleOptions,
  PinataModuleOptionsFactory,
} from '../../lib/pinata/pinata.interface';
import pinataConfigOption from './pinata.config.option';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class PinataConfigService implements PinataModuleOptionsFactory {
  constructor(
    @Inject(pinataConfigOption.KEY)
    private readonly pinataConfig: ConfigType<typeof pinataConfigOption>,
  ) {}

  createPinataModuleOptions():
    | Promise<PinataModuleOptions>
    | PinataModuleOptions {
    return this.pinataConfig;
  }
}
