import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  IpfsStorageModuleAsyncOptions,
  IpfsStorageModuleOptions,
  IpfsStorageModuleOptionsFactory,
} from './ipfs-storage.interface';
import {
  createIpfsConnection,
  getIpfsStorageConnectionToken,
  getIpfsStorageOptionsToken,
} from './ipfs-storage.util';

@Global()
@Module({})
export class IpfsStorageCoreModule {
  static forRoot(
    options: IpfsStorageModuleOptions,
    connection?: string,
  ): DynamicModule {
    const ipfsStorageOptionsProvider: Provider = {
      provide: getIpfsStorageOptionsToken(connection),
      useValue: options,
    };

    const ipfsConnectionProvider: Provider = {
      provide: getIpfsStorageConnectionToken(connection),
      useValue: createIpfsConnection(options),
    };

    return {
      module: IpfsStorageCoreModule,
      providers: [ipfsStorageOptionsProvider, ipfsConnectionProvider],
      exports: [ipfsStorageOptionsProvider, ipfsConnectionProvider],
    };
  }

  static forRootAsync(
    options: IpfsStorageModuleAsyncOptions,
    connection: string,
  ): DynamicModule {
    const ipfsStorageConnectionProvider: Provider = {
      provide: getIpfsStorageConnectionToken(connection),
      useFactory(options: IpfsStorageModuleOptions) {
        return createIpfsConnection(options);
      },
      inject: [getIpfsStorageOptionsToken(connection)],
    };

    return {
      module: IpfsStorageCoreModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options, connection),
        ipfsStorageConnectionProvider,
      ],
      exports: [ipfsStorageConnectionProvider],
    };
  }

  static createAsyncProviders(
    options: IpfsStorageModuleAsyncOptions,
    connection?: string,
  ): Provider[] {
    if (!(options.useExisting || options.useFactory || options.useClass)) {
      throw new Error(
        'Invalid configuration. Must provide useFactory, useClass or useExisting',
      );
    }

    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options, connection)];
    }

    return [
      this.createAsyncOptionsProvider(options, connection),
      { provide: options.useClass, useClass: options.useClass },
    ];
  }

  static createAsyncOptionsProvider(
    options: IpfsStorageModuleAsyncOptions,
    connection?: string,
  ): Provider {
    if (!(options.useExisting || options.useFactory || options.useClass)) {
      throw new Error(
        'Invalid configuration. Must provide useFactory, useClass or useExisting',
      );
    }

    if (options.useFactory) {
      return {
        provide: getIpfsStorageOptionsToken(connection),
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: getIpfsStorageOptionsToken(connection),
      async useFactory(
        optionsFactory: IpfsStorageModuleOptionsFactory,
      ): Promise<IpfsStorageModuleOptions> {
        return optionsFactory.createIpfsStorageModuleOptions();
      },
      inject: [options.useClass || options.useExisting],
    };
  }
}
