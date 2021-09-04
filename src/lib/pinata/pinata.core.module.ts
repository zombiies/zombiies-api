import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  PinataModuleAsyncOptions,
  PinataModuleOptions,
  PinataModuleOptionsFactory,
} from './pinata.interface';
import {
  createPinataConnection,
  getPinataConnectionToken,
  getPinataOptionsToken,
} from './pinata.util';

@Global()
@Module({})
export class PinataCoreModule {
  static forRoot(
    options: PinataModuleOptions,
    connection?: string,
  ): DynamicModule {
    const pinataOptionsProvider: Provider = {
      provide: getPinataOptionsToken(connection),
      useValue: options,
    };

    const pinataConnectionProvider: Provider = {
      provide: getPinataConnectionToken(connection),
      useValue: createPinataConnection(options),
    };

    return {
      module: PinataCoreModule,
      providers: [pinataOptionsProvider, pinataConnectionProvider],
      exports: [pinataOptionsProvider, pinataConnectionProvider],
    };
  }

  static forRootAsync(
    options: PinataModuleAsyncOptions,
    connection: string,
  ): DynamicModule {
    const pinataConnectionProvider: Provider = {
      provide: getPinataConnectionToken(connection),
      useFactory(options: PinataModuleOptions) {
        return createPinataConnection(options);
      },
      inject: [getPinataOptionsToken(connection)],
    };

    return {
      module: PinataCoreModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options, connection),
        pinataConnectionProvider,
      ],
      exports: [pinataConnectionProvider],
    };
  }

  static createAsyncProviders(
    options: PinataModuleAsyncOptions,
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
    options: PinataModuleAsyncOptions,
    connection?: string,
  ): Provider {
    if (!(options.useExisting || options.useFactory || options.useClass)) {
      throw new Error(
        'Invalid configuration. Must provide useFactory, useClass or useExisting',
      );
    }

    if (options.useFactory) {
      return {
        provide: getPinataOptionsToken(connection),
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: getPinataOptionsToken(connection),
      async useFactory(
        optionsFactory: PinataModuleOptionsFactory,
      ): Promise<PinataModuleOptions> {
        return optionsFactory.createPinataModuleOptions();
      },
      inject: [options.useClass || options.useExisting],
    };
  }
}
