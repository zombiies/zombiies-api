import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export type IpfsStorageModuleOptions = {
  token: string;
};

export interface IpfsStorageModuleOptionsFactory {
  createIpfsStorageModuleOptions():
    | Promise<IpfsStorageModuleOptions>
    | IpfsStorageModuleOptions;
}

export interface IpfsStorageModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<IpfsStorageModuleOptionsFactory>;
  useExisting?: Type<IpfsStorageModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<IpfsStorageModuleOptions> | IpfsStorageModuleOptions;
}
