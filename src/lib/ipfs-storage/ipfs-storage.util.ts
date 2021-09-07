import {
  IPFS_STORAGE_MODULE_CONNECTION,
  IPFS_STORAGE_MODULE_CONNECTION_TOKEN,
  IPFS_STORAGE_MODULE_OPTIONS_TOKEN,
} from './ipfs-storage.constant';
import { IpfsStorageModuleOptions } from './ipfs-storage.interface';
import { IpfsStorage } from './ipfs-storage';

const createIpfsStorage = ({ token }: IpfsStorageModuleOptions): IpfsStorage =>
  new IpfsStorage({ token });

export const getIpfsStorageOptionsToken = (connection: string): string =>
  `${
    connection || IPFS_STORAGE_MODULE_CONNECTION
  }_${IPFS_STORAGE_MODULE_OPTIONS_TOKEN}`;

export const getIpfsStorageConnectionToken = (connection: string): string =>
  `${
    connection || IPFS_STORAGE_MODULE_CONNECTION
  }_${IPFS_STORAGE_MODULE_CONNECTION_TOKEN}`;

export const createIpfsConnection = (
  options: IpfsStorageModuleOptions,
): IpfsStorage => {
  return createIpfsStorage(options);
};
