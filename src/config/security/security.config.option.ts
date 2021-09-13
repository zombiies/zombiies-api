import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { getEnvConfig } from '../env.config';

type SecurityConfigOption = {
  bcryptRound: number;
  jwt: JwtModuleOptions;
};

export const getSecurityConfig = (): SecurityConfigOption => {
  const { BCRYPT_ROUND, JWT_SECRET, JWT_EXPIRE_IN } = getEnvConfig();

  return {
    bcryptRound: BCRYPT_ROUND,
    jwt: {
      secret: JWT_SECRET,
      signOptions: {
        expiresIn: JWT_EXPIRE_IN,
      },
    },
  };
};

const securityConfigOption = registerAs('security', () => getSecurityConfig());
export default securityConfigOption;
