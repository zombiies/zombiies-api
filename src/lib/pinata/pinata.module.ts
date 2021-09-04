import { DynamicModule, Module } from '@nestjs/common';
import {
  PinataModuleAsyncOptions,
  PinataModuleOptions,
} from './pinata.interface';
import { PinataCoreModule } from './pinata.core.module';

@Module({})
export class PinataModule {
  public static forRoot(
    options: PinataModuleOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: PinataModule,
      imports: [PinataCoreModule.forRoot(options, connection)],
      exports: [PinataCoreModule],
    };
  }

  public static forRootAsync(
    options: PinataModuleAsyncOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: PinataModule,
      imports: [PinataCoreModule.forRootAsync(options, connection)],
      exports: [PinataCoreModule],
    };
  }
}
