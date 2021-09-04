import { PinataModuleOptions } from '../../lib/pinata/pinata.interface';
import { cleanEnv, str } from 'envalid';
import { registerAs } from '@nestjs/config';

type PinataConfigOption = PinataModuleOptions;

export const getPinataOption = (): PinataConfigOption => {
  const env = cleanEnv(process.env, {
    PINATA_API_KEY: str(),
    PINATA_SECRET: str(),
  });

  return {
    apiKey: env.PINATA_API_KEY,
    secret: env.PINATA_SECRET,
  };
};

const pinataConfigOption = registerAs('pinata', () => getPinataOption());
export default pinataConfigOption;
