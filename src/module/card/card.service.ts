import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CardDocument } from './schema/card.schema';
import { FilterQuery, Model } from 'mongoose';
import { User } from '../user/schema/user.schema';
import { CardType } from './enum/card-type.enum';
import { RareLevel, RareLevels } from './enum/rare-level.enum';
import { InjectIpfsStorage, makeFileObject } from '../../lib/ipfs-storage';
import { getTokenIdsFromReceipt } from '../../util/contract';
import { EtherClientService } from '../ether-client/ether-client.service';
import { SettingService } from '../setting/setting.service';
import { Web3Storage } from 'web3.storage';
import { RandomService } from '../random/random.service';
import { BigNumber } from 'ethers';
import { CardTokenModel } from './model/card-token.model';
import { ContractToken } from './interface/contract-token.interface';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
    private readonly ethClient: EtherClientService,
    private readonly setting: SettingService,
    private readonly random: RandomService,
    @InjectIpfsStorage() private readonly ipfsStorage: Web3Storage,
  ) {}

  private _allCards: CardDocument[];

  async getAllCard(): Promise<CardDocument[]> {
    if (typeof this._allCards === 'undefined') {
      this._allCards = await this.cardModel.find();
    }

    return this._allCards;
  }

  async createCard(params: Card) {
    const card = new this.cardModel(params);
    await card.save();

    return card;
  }

  async deleteAll() {
    await this.cardModel.deleteMany();
  }

  getContract() {
    return this.ethClient.getContract();
  }

  async findOne(query: FilterQuery<CardDocument>) {
    return this.cardModel.findOne(query).exec();
  }

  async findMany(query: FilterQuery<CardDocument>) {
    return this.cardModel.find(query).exec();
  }

  async getStarterPackFee() {
    return this.getContract().getStarterPackFee();
  }

  async buyStarterPack(user: User) {
    const buyerWallet = this.ethClient.getWalletOfUser(user);
    const buyerBalance = await this.getContract().balanceOf(
      buyerWallet.address,
    );

    if (buyerBalance.gt(0)) {
      throw new HttpException('Already bought starter pack', 400);
    }

    const fee = await this.getStarterPackFee();
    const buyTx = await buyerWallet.sendTransaction({
      to: this.ethClient.ownerWallet.address,
      value: fee,
    });
    const buyReceipt = await buyTx.wait();
    const buyTxHash = buyReceipt.transactionHash;

    try {
      const { randoms: monsterRandoms, cards: monsterCards } =
        await this.getRandomCardsWithRandomValue(
          buyTxHash,
          CardType.MONSTER,
          8,
          1,
          RareLevel.RARE,
        );

      const { randoms: equipmentRandoms, cards: equipmentCards } =
        await this.getRandomCardsWithRandomValue(
          buyTxHash,
          CardType.EQUIPMENT,
          8,
          1,
          RareLevel.RARE,
        );

      const proof = {
        seed: buyTxHash,
        monsters: {
          randoms: monsterRandoms,
          cards: monsterCards.map((c) => c.cid),
        },
        equipments: {
          randoms: equipmentRandoms,
          cards: equipmentCards.map((c) => c.cid),
        },
      };

      const proofCid = await this.ipfsStorage.put([makeFileObject(proof)]);
      const tokenCids = monsterCards.concat(equipmentCards).map((c) => c.cid);

      const buyStarterPackTx = await this.ethClient
        .getContract()
        .buyStarterPack(buyerWallet.address, tokenCids, proofCid);
      const receipt = await buyStarterPackTx.wait();

      const createdTokenIds = getTokenIdsFromReceipt(receipt);

      return this.findCardTokens(createdTokenIds);
    } catch (e) {
      await this.ethClient.ownerWallet.sendTransaction({
        to: buyerWallet.address,
        value: fee,
      });

      throw new InternalServerErrorException();
    }
  }

  async getCardTokensFromToken(
    tokens: ContractToken[],
  ): Promise<CardTokenModel[]> {
    const allCards = await this.getAllCard();

    return tokens
      .map(({ id, uri }) => {
        const card = allCards.find(({ cid }) => cid === uri);

        return card
          ? {
              tokenId: id.toHexString(),
              ...card.toObject(),
            }
          : undefined;
      })
      .filter((c) => !!c);
  }

  async findCardTokens(ids: BigNumber[]): Promise<CardTokenModel[]> {
    const tokens = await this.getContract().tokensIn(ids);

    return this.getCardTokensFromToken(tokens);
  }

  async getCardTokensOfUser(user: User) {
    const wallet = this.ethClient.getWalletOfUser(user);
    const tokens = await this.getContract().tokensOf(wallet.address);

    return this.getCardTokensFromToken(tokens);
  }

  async getRandomCardsWithRandomValue(
    seed: string,
    type: CardType,
    count = 1,
    maxLevel = 8,
    maxRareLevel = RareLevel.ELITE,
  ) {
    const rng = this.random.createRng(seed);
    const randoms = [];
    const cards: Card[] = [];
    const acceptRareLevels = RareLevels.slice(
      0,
      RareLevels.indexOf(maxRareLevel) + 1,
    );

    do {
      const ranNum = await this.random.getRandomNumber(rng);
      const randomCard = await this.findOne({
        startSeed: {
          $lte: ranNum,
        },
        endSeed: {
          $gt: ranNum,
        },
        level: {
          $lte: maxLevel,
        },
        rareLevel: {
          $in: acceptRareLevels,
        },
        type: type,
      });

      if (randomCard) {
        cards.push(randomCard);
      }

      randoms.push({
        value: ranNum,
        take: !!randomCard,
      });
    } while (cards.length !== count);

    return {
      randoms,
      cards,
    };
  }
}
