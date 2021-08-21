import { Inject } from '@nestjs/common';
import { getPubSubConnectionToken } from './pub-sub.util';

export const InjectPubSub = (connection?: string) => {
  return Inject(getPubSubConnectionToken(connection));
};
