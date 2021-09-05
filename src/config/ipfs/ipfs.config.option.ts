import { IpfsModuleOptions } from '../../lib/ipfs/ipfs.interface';
import { cleanEnv, str } from 'envalid';
import { registerAs } from '@nestjs/config';

type IpfsConfigOption = IpfsModuleOptions;

export const getIpfsOption = (): IpfsConfigOption => {
  const env = cleanEnv(process.env, {
    NFT_STORAGE_API_TOKEN: str(),
  });

  return {
    apiToken: env.NFT_STORAGE_API_TOKEN,
  };
};

const ipfsConfigOption = registerAs('ipfs', () => getIpfsOption());
export default ipfsConfigOption;
