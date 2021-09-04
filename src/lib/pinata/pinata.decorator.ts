import { getPinataConnectionToken } from './pinata.util';
import { Inject } from '@nestjs/common';

export const InjectPinata = (connection?: string) =>
  Inject(getPinataConnectionToken(connection));
