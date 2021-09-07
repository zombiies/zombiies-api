import { File, PutOptions, Web3Storage } from 'web3.storage';
import { Buffer } from 'buffer';

export class IpfsStorage extends Web3Storage {
  makeFileObject(obj: any, filename = 'data.json') {
    const buffer = Buffer.from(JSON.stringify(obj));
    return new File([buffer], filename);
  }

  async putObject(obj: any, filename = 'data.json', options: PutOptions = {}) {
    return super.put([this.makeFileObject(obj, filename)], {
      wrapWithDirectory: false,
      ...options,
    });
  }
}
