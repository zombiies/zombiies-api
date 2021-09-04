import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export type PinataModuleOptions = {
  apiKey: string;
  secret: string;
};

export interface PinataModuleOptionsFactory {
  createPinataModuleOptions():
    | Promise<PinataModuleOptions>
    | PinataModuleOptions;
}

export interface PinataModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<PinataModuleOptionsFactory>;
  useExisting?: Type<PinataModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<PinataModuleOptions> | PinataModuleOptions;
}
