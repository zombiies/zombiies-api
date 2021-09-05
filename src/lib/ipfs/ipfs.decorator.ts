import { getIpfsConnectionToken } from './ipfs.util';
import { Inject } from '@nestjs/common';

export const InjectIpfsClient = (connection?: string) =>
  Inject(getIpfsConnectionToken(connection));
