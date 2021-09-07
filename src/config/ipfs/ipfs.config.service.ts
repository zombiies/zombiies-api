import { Inject, Injectable } from '@nestjs/common';
import {
  IpfsStorageModuleOptions,
  IpfsStorageModuleOptionsFactory,
} from '../../lib/ipfs-storage';
import ipfsConfigOption from './ipfs.config.option';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class IpfsConfigService implements IpfsStorageModuleOptionsFactory {
  constructor(
    @Inject(ipfsConfigOption.KEY)
    private readonly ipfsConfig: ConfigType<typeof ipfsConfigOption>,
  ) {}

  createIpfsStorageModuleOptions():
    | Promise<IpfsStorageModuleOptions>
    | IpfsStorageModuleOptions {
    return this.ipfsConfig;
  }
}
