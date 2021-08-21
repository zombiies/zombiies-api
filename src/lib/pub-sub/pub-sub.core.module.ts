import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  PubSubModuleAsyncOptions,
  PubSubModuleOptions,
  PubSubModuleOptionsFactory,
} from './pub-sub.interface';
import {
  createPubSubConnection,
  getPubSubConnectionToken,
  getPubSubOptionsToken,
} from './pub-sub.util';

@Global()
@Module({})
export class PubSubCoreModule {
  static forRoot(
    options: PubSubModuleOptions,
    connection?: string,
  ): DynamicModule {
    const pubSubOptionsProvider: Provider = {
      provide: getPubSubOptionsToken(connection),
      useValue: options,
    };

    const pubSubConnectionProvider: Provider = {
      provide: getPubSubConnectionToken(connection),
      useValue: createPubSubConnection(options),
    };

    return {
      module: PubSubCoreModule,
      providers: [pubSubOptionsProvider, pubSubConnectionProvider],
      exports: [pubSubOptionsProvider, pubSubConnectionProvider],
    };
  }

  static forRootAsync(
    options: PubSubModuleAsyncOptions,
    connection: string,
  ): DynamicModule {
    const pubSubConnectionProvider: Provider = {
      provide: getPubSubConnectionToken(connection),
      useFactory(options: PubSubModuleOptions) {
        return createPubSubConnection(options);
      },
      inject: [getPubSubOptionsToken(connection)],
    };

    return {
      module: PubSubCoreModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options, connection),
        pubSubConnectionProvider,
      ],
      exports: [pubSubConnectionProvider],
    };
  }

  static createAsyncProviders(
    options: PubSubModuleAsyncOptions,
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
    options: PubSubModuleAsyncOptions,
    connection?: string,
  ): Provider {
    if (!(options.useExisting || options.useFactory || options.useClass)) {
      throw new Error(
        'Invalid configuration. Must provide useFactory, useClass or useExisting',
      );
    }

    if (options.useFactory) {
      return {
        provide: getPubSubOptionsToken(connection),
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: getPubSubOptionsToken(connection),
      async useFactory(
        optionsFactory: PubSubModuleOptionsFactory,
      ): Promise<PubSubModuleOptions> {
        return optionsFactory.createPubSubModuleOptions();
      },
      inject: [options.useClass || options.useExisting],
    };
  }
}
