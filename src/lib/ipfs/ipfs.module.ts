import { DynamicModule, Module } from '@nestjs/common';
import { IpfsModuleAsyncOptions, IpfsModuleOptions } from './ipfs.interface';
import { IpfsCoreModule } from './ipfs.core.module';

@Module({})
export class IpfsModule {
  public static forRoot(
    options: IpfsModuleOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: IpfsModule,
      imports: [IpfsCoreModule.forRoot(options, connection)],
      exports: [IpfsCoreModule],
    };
  }

  public static forRootAsync(
    options: IpfsModuleAsyncOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: IpfsModule,
      imports: [IpfsCoreModule.forRootAsync(options, connection)],
      exports: [IpfsCoreModule],
    };
  }
}
