import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export type IpfsModuleOptions = {
  apiToken: string;
};

export interface IpfsModuleOptionsFactory {
  createIpfsModuleOptions(): Promise<IpfsModuleOptions> | IpfsModuleOptions;
}

export interface IpfsModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<IpfsModuleOptionsFactory>;
  useExisting?: Type<IpfsModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<IpfsModuleOptions> | IpfsModuleOptions;
}
