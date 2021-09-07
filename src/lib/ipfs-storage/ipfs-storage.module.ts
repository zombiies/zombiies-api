import { DynamicModule, Module } from '@nestjs/common';
import {
  IpfsStorageModuleAsyncOptions,
  IpfsStorageModuleOptions,
} from './ipfs-storage.interface';
import { IpfsStorageCoreModule } from './ipfs-storage.core.module';

@Module({})
export class IpfsStorageModule {
  public static forRoot(
    options: IpfsStorageModuleOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: IpfsStorageModule,
      imports: [IpfsStorageCoreModule.forRoot(options, connection)],
      exports: [IpfsStorageCoreModule],
    };
  }

  public static forRootAsync(
    options: IpfsStorageModuleAsyncOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: IpfsStorageModule,
      imports: [IpfsStorageCoreModule.forRootAsync(options, connection)],
      exports: [IpfsStorageCoreModule],
    };
  }
}
