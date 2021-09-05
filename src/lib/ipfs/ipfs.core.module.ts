import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  IpfsModuleAsyncOptions,
  IpfsModuleOptions,
  IpfsModuleOptionsFactory,
} from './ipfs.interface';
import {
  createIpfsConnection,
  getIpfsConnectionToken,
  getIpfsOptionsToken,
} from './ipfs.util';

@Global()
@Module({})
export class IpfsCoreModule {
  static forRoot(
    options: IpfsModuleOptions,
    connection?: string,
  ): DynamicModule {
    const ipfsOptionsProvider: Provider = {
      provide: getIpfsOptionsToken(connection),
      useValue: options,
    };

    const ipfsConnectionProvider: Provider = {
      provide: getIpfsConnectionToken(connection),
      useValue: createIpfsConnection(options),
    };

    return {
      module: IpfsCoreModule,
      providers: [ipfsOptionsProvider, ipfsConnectionProvider],
      exports: [ipfsOptionsProvider, ipfsConnectionProvider],
    };
  }

  static forRootAsync(
    options: IpfsModuleAsyncOptions,
    connection: string,
  ): DynamicModule {
    const ipfsConnectionProvider: Provider = {
      provide: getIpfsConnectionToken(connection),
      useFactory(options: IpfsModuleOptions) {
        return createIpfsConnection(options);
      },
      inject: [getIpfsOptionsToken(connection)],
    };

    return {
      module: IpfsCoreModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options, connection),
        ipfsConnectionProvider,
      ],
      exports: [ipfsConnectionProvider],
    };
  }

  static createAsyncProviders(
    options: IpfsModuleAsyncOptions,
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
    options: IpfsModuleAsyncOptions,
    connection?: string,
  ): Provider {
    if (!(options.useExisting || options.useFactory || options.useClass)) {
      throw new Error(
        'Invalid configuration. Must provide useFactory, useClass or useExisting',
      );
    }

    if (options.useFactory) {
      return {
        provide: getIpfsOptionsToken(connection),
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: getIpfsOptionsToken(connection),
      async useFactory(
        optionsFactory: IpfsModuleOptionsFactory,
      ): Promise<IpfsModuleOptions> {
        return optionsFactory.createIpfsModuleOptions();
      },
      inject: [options.useClass || options.useExisting],
    };
  }
}
