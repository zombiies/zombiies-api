import {
  IPFS_STORAGE_MODULE_CONNECTION,
  IPFS_STORAGE_MODULE_CONNECTION_TOKEN,
  IPFS_STORAGE_MODULE_OPTIONS_TOKEN,
} from './ipfs-storage.constant';
import { IpfsStorageModuleOptions } from './ipfs-storage.interface';
import { Web3Storage, File } from 'web3.storage';
import { Buffer } from 'buffer';

const createIpfsStorage = ({ token }: IpfsStorageModuleOptions): Web3Storage =>
  new Web3Storage({ token });

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
): Web3Storage => {
  return createIpfsStorage(options);
};

export const makeFileObject = (obj: any, filename = 'data.json') => {
  const buffer = Buffer.from(JSON.stringify(obj));

  return new File([buffer], filename);
};
