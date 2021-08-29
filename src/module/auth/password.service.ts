import { Inject, Injectable } from '@nestjs/common';
import securityConfigOption from '../../config/security/security.config.option';
import { ConfigType } from '@nestjs/config';
import { compare, hash } from 'bcrypt';

@Injectable()
export class PasswordService {
  constructor(
    @Inject(securityConfigOption.KEY)
    private readonly securityConfig: ConfigType<typeof securityConfigOption>,
  ) {}

  get bcryptRound(): number {
    return this.securityConfig.bcryptRound;
  }

  async validatePassword(
    password: string,
    passwordDigest: string,
  ): Promise<boolean> {
    return compare(password, passwordDigest);
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password, this.bcryptRound);
  }
}
