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
import { User } from '../user/schema/user.schema';
import { BigNumber } from 'ethers';
import { isDev } from '../../common/util/node-env.util';

@Injectable()
export class EtherClientService {
  constructor(
    @Inject(ethersConfigOption.KEY)
    private readonly config: ConfigType<typeof ethersConfigOption>,
    private readonly signer: EthersSigner,
    private readonly ethersContract: EthersContract,
  ) {}

  private _ownerWallet: WalletSigner;
  private _contract: Contract;

  get contract(): Contract {
    if (typeof this._contract === 'undefined') {
      this._contract = this.ethersContract.create(
        this.config.contractAddress,
        ABI,
        this.ownerWallet,
      ) as Contract;
    }

    return this._contract;
  }

  get ownerWallet(): WalletSigner {
    if (typeof this._ownerWallet === 'undefined') {
      this._ownerWallet = this.signer.createWallet(this.config.ownerPrivateKey);
    }

    return this._ownerWallet;
  }

  async createNewWallet(): Promise<WalletSigner> {
    const newWallet = this.signer.createRandomWallet();

    if (isDev()) {
      await (
        await this.ownerWallet.sendTransaction({
          to: newWallet.address,
          value: parseEther('0.1'),
        })
      ).wait();
    }

    return newWallet;
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

  async isOwnerOf(address: string, tokenId: BigNumber) {
    return (await this.contract.ownerOf(tokenId)) === address;
  }
}
