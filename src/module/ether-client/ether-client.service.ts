import { Inject, Injectable } from '@nestjs/common';
import {
  EthersContract,
  EthersSigner,
  SmartContract,
  WalletSigner,
} from 'nestjs-ethers';
import ethersConfigOption from '../../config/ethers/ethers.config.option';
import { ConfigType } from '@nestjs/config';
import * as ABI from './abi/ZombiiesToken.json';
import { AES, enc } from 'crypto-js';

@Injectable()
export class EtherClientService {
  constructor(
    @Inject(ethersConfigOption.KEY)
    private readonly config: ConfigType<typeof ethersConfigOption>,
    private readonly signer: EthersSigner,
    private readonly ethersContract: EthersContract,
  ) {
    (async () => {
      console.log(await this.getContract().getCountToLevelUp());
    })();
  }

  private ownerWallet: WalletSigner;
  private contract: SmartContract;

  getOwnerWallet(): WalletSigner {
    if (typeof this.ownerWallet === 'undefined') {
      this.ownerWallet = this.signer.createWallet(this.config.ownerPrivateKey);
    }

    return this.ownerWallet;
  }

  createNewWallet(): WalletSigner {
    return this.signer.createRandomWallet();
  }

  createWalletFromPrivateKey(privateKey: string): WalletSigner {
    return this.signer.createWallet(privateKey);
  }

  createWalletFromPrivateKeyCipher(cipher: string): WalletSigner {
    return this.signer.createWallet(
      AES.decrypt(cipher, this.config.privateKeySecret).toString(enc.Utf8),
    );
  }

  createNewPrivateKeyCipher(): string {
    return AES.encrypt(
      this.createNewWallet().privateKey,
      this.config.privateKeySecret,
    ).toString();
  }

  getContract(): SmartContract {
    if (typeof this.contract === 'undefined') {
      this.contract = this.ethersContract.create(
        this.config.contractAddress,
        ABI,
        this.getOwnerWallet(),
      );
    }

    return this.contract;
  }
}
