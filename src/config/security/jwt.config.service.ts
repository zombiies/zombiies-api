import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import securityConfigOption from './security.config.option';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(
    @Inject(securityConfigOption.KEY)
    private readonly securityConfig: ConfigType<typeof securityConfigOption>,
  ) {}

  createJwtOptions(): Promise<JwtModuleOptions> | JwtModuleOptions {
    return this.securityConfig.jwt;
  }
}
