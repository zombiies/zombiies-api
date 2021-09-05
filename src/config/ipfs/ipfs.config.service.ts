import { Inject, Injectable } from '@nestjs/common';
import { IpfsModuleOptions, IpfsModuleOptionsFactory } from '../../lib/ipfs';
import ipfsConfigOption from './ipfs.config.option';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class IpfsConfigService implements IpfsModuleOptionsFactory {
  constructor(
    @Inject(ipfsConfigOption.KEY)
    private readonly ipfsConfig: ConfigType<typeof ipfsConfigOption>,
  ) {}

  createIpfsModuleOptions(): Promise<IpfsModuleOptions> | IpfsModuleOptions {
    return this.ipfsConfig;
  }
}
