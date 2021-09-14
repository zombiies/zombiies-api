import { IpfsStorageModuleOptions } from '../../lib/ipfs-storage';
import { registerAs } from '@nestjs/config';
import { getProcessEnv } from '../../common/env/process.env';

type IpfsConfigOption = IpfsStorageModuleOptions;

export const getIpfsOption = (): IpfsConfigOption => {
  const { WEB3_STORAGE_TOKEN } = getProcessEnv();

  return {
    token: WEB3_STORAGE_TOKEN,
  };
};

const ipfsConfigOption = registerAs('ipfs-storage', () => getIpfsOption());
export default ipfsConfigOption;
