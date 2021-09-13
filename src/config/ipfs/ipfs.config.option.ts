import { IpfsStorageModuleOptions } from '../../lib/ipfs-storage';
import { registerAs } from '@nestjs/config';
import { getEnvConfig } from '../env.config';

type IpfsConfigOption = IpfsStorageModuleOptions;

export const getIpfsOption = (): IpfsConfigOption => {
  const { WEB3_STORAGE_TOKEN } = getEnvConfig();

  return {
    token: WEB3_STORAGE_TOKEN,
  };
};

const ipfsConfigOption = registerAs('ipfs-storage', () => getIpfsOption());
export default ipfsConfigOption;
