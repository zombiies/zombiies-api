import { cleanEnv, num, str } from 'envalid';
import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

type SecurityConfigOption = {
  bcryptRound: number;
  jwt: JwtModuleOptions;
};

export const getSecurityConfig = (): SecurityConfigOption => {
  const env = cleanEnv(process.env, {
    BCRYPT_ROUND: num(),
    JWT_SECRET: str(),
    JWT_EXPIRE_IN: str(),
  });

  return {
    bcryptRound: env.BCRYPT_ROUND,
    jwt: {
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: env.JWT_EXPIRE_IN,
      },
    },
  };
};

const securityConfigOption = registerAs('security', () => getSecurityConfig());
export default securityConfigOption;
