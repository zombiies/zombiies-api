import { IpfsStorageModuleOptions } from '../../lib/ipfs-storage';
import { cleanEnv, str } from 'envalid';
import { registerAs } from '@nestjs/config';

type IpfsConfigOption = IpfsStorageModuleOptions;

export const getIpfsOption = (): IpfsConfigOption => {
  const { WEB3_STORAGE_TOKEN } = cleanEnv(process.env, {
    WEB3_STORAGE_TOKEN: str(),
  });

  return {
    token: WEB3_STORAGE_TOKEN,
  };
};

const ipfsConfigOption = registerAs('ipfs-storage', () => getIpfsOption());
export default ipfsConfigOption;
