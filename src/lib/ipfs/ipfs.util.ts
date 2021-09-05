import {
  IPFS_MODULE_CONNECTION,
  IPFS_MODULE_CONNECTION_TOKEN,
  IPFS_MODULE_OPTIONS_TOKEN,
} from './ipfs.constant';
import { IpfsModuleOptions } from './ipfs.interface';
import { NFTStorage, Blob } from 'nft.storage';

const createIpfsClient = (apiToken: string): NFTStorage =>
  new NFTStorage({ token: apiToken });

export const getIpfsOptionsToken = (connection: string): string =>
  `${connection || IPFS_MODULE_CONNECTION}_${IPFS_MODULE_OPTIONS_TOKEN}`;

export const getIpfsConnectionToken = (connection: string): string =>
  `${connection || IPFS_MODULE_CONNECTION}_${IPFS_MODULE_CONNECTION_TOKEN}`;

export const createIpfsConnection = (
  options: IpfsModuleOptions,
): NFTStorage => {
  const { apiToken } = options;

  return createIpfsClient(apiToken);
};

export const createBlobFromObject = (obj: any) => {
  const str = JSON.stringify(obj, null, 2);
  const bytes = new TextEncoder().encode(str);

  return new Blob([bytes], {
    type: 'application/json;charset=utf-8',
  });
};
