import { Inject, Injectable } from '@nestjs/common';
import {
  EthersContract,
  EthersSigner,
  parseEther,
  WalletSigner,
} from 'nestjs-ethers';
import ethersConfigOption from '../../config/ethers/ethers.config.option';
import { ConfigType } from '@nestjs/config';
import * as ABI from './abi/ZombiiesToken.json';
import { AES, enc } from 'crypto-js';
import { Contract } from './typechain';
import { getNodeEnv, NodeEnv } from '../../util/node-env';
import { User } from '../user/schema/user.schema';

@Injectable()
export class EtherClientService {
  constructor(
    @Inject(ethersConfigOption.KEY)
    private readonly config: ConfigType<typeof ethersConfigOption>,
    private readonly signer: EthersSigner,
    private readonly ethersContract: EthersContract,
  ) {}

  private _ownerWallet: WalletSigner;
  private contract: Contract;
  private _faucetWallet: WalletSigner;

  get faucetWallet(): WalletSigner {
    if (typeof this._faucetWallet === 'undefined') {
      this._faucetWallet = this.signer.createWallet(
        this.config.faucetPrivateKey,
      );
    }

    return this._faucetWallet;
  }

  get ownerWallet(): WalletSigner {
    if (typeof this._ownerWallet === 'undefined') {
      this._ownerWallet = this.signer.createWallet(this.config.ownerPrivateKey);
    }

    return this._ownerWallet;
  }

  async createNewWallet(): Promise<WalletSigner> {
    const wallet = this.signer.createRandomWallet();

    if (getNodeEnv() === NodeEnv.DEVELOPMENT) {
      const tx = await this.faucetWallet.sendTransaction({
        to: wallet.address,
        value: parseEther('0.1'),
      });
      await tx.wait();
    }

    return wallet;
  }

  createWalletFromPrivateKey(privateKey: string): WalletSigner {
    return this.signer.createWallet(privateKey);
  }

  createWalletFromPrivateKeyCipher(cipher: string): WalletSigner {
    return this.signer.createWallet(
      AES.decrypt(cipher, this.config.privateKeySecret).toString(enc.Utf8),
    );
  }

  getWalletOfUser(user: User): WalletSigner {
    return this.createWalletFromPrivateKeyCipher(user.privateKeyCipher);
  }

  async createNewPrivateKeyCipher(): Promise<string> {
    const newWallet = await this.createNewWallet();

    return AES.encrypt(
      newWallet.privateKey,
      this.config.privateKeySecret,
    ).toString();
  }

  getContract(): Contract {
    if (typeof this.contract === 'undefined') {
      this.contract = this.ethersContract.create(
        this.config.contractAddress,
        ABI,
        this.ownerWallet,
      ) as Contract;
    }

    return this.contract;
  }
}
