import { DynamicModule, Module } from '@nestjs/common';
import {
  PubSubModuleAsyncOptions,
  PubSubModuleOptions,
} from './pub-sub.interface';
import { PubSubCoreModule } from './pub-sub.core.module';

@Module({})
export class PubSubModule {
  public static forRoot(
    options: PubSubModuleOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: PubSubModule,
      imports: [PubSubCoreModule.forRoot(options, connection)],
      exports: [PubSubCoreModule],
    };
  }

  public static forRootAsync(
    options: PubSubModuleAsyncOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: PubSubModule,
      imports: [PubSubCoreModule.forRootAsync(options, connection)],
      exports: [PubSubCoreModule],
    };
  }
}
