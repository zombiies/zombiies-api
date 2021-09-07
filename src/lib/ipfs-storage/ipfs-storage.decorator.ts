import { getIpfsStorageConnectionToken } from './ipfs-storage.util';
import { Inject } from '@nestjs/common';

export const InjectIpfsStorage = (connection?: string) =>
  Inject(getIpfsStorageConnectionToken(connection));
