import { Injectable } from '@nestjs/common';
import { getNodeEnv } from './util/node-env';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello World! Node env: ${getNodeEnv()}`;
  }
}
