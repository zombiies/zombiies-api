import { Injectable } from '@nestjs/common';
import { getNodeEnv } from './common/util/node-env.util';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello World! Node env: ${getNodeEnv()}`;
  }
}
