import { Inject, Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import mongoConfigOption from './mongo.config.option';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class MongoConfigService implements MongooseOptionsFactory {
  constructor(
    @Inject(mongoConfigOption.KEY)
    private readonly mongoConfig: ConfigType<typeof mongoConfigOption>,
  ) {}

  createMongooseOptions():
    | Promise<MongooseModuleOptions>
    | MongooseModuleOptions {
    return this.mongoConfig;
  }
}
