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
import { InjectIpfsStorage, IpfsStorage } from '../../lib/ipfs-storage';
import { getTokenIdsFromReceipt } from '../../util/contract';
import { EtherClientService } from '../ether-client/ether-client.service';
import { BigNumber } from 'ethers';
import { CardTokenModel } from './model/card-token.model';
import { ContractToken } from './interface/contract-token.interface';
import { createRng, nextInt } from '../../util/random';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
    private readonly ethClient: EtherClientService,
    @InjectIpfsStorage() private readonly ipfsStorage: IpfsStorage,
  ) {}

  async getAllCard(): Promise<CardDocument[]> {
    return this.cardModel.find().exec();
  }

  get contract() {
    return this.ethClient.contract;
  }

  get ownerWallet() {
    return this.ethClient.ownerWallet;
  }

  async getMaxCardSeed(): Promise<number> {
    const maxSeedCard = await this.cardModel
      .findOne()
      .sort({
        endSeed: -1,
      })
      .exec();

    return maxSeedCard.endSeed;
  }

  async createCard(params: Card) {
    const card = new this.cardModel(params);
    await card.save();

    return card;
  }

  async deleteAll() {
    await this.cardModel.deleteMany();
  }

  async findOne(query: FilterQuery<CardDocument>) {
    return this.cardModel.findOne(query).exec();
  }

  async findMany(query: FilterQuery<CardDocument>) {
    return this.cardModel.find(query).exec();
  }

  async getStarterPackFee() {
    return this.contract.getStarterPackFee();
  }

  async canBuyStarterPack(user: User) {
    const buyerWallet = this.ethClient.getWalletOfUser(user);
    const buyerBalance = await this.contract.balanceOf(buyerWallet.address);

    return buyerBalance.eq(0);
  }

  async buyStarterPack(user: User) {
    if (!(await this.canBuyStarterPack(user))) {
      throw new HttpException('Already bought starter pack', 400);
    }

    const buyerWallet = this.ethClient.getWalletOfUser(user);

    const fee = await this.getStarterPackFee();
    const buyTx = await buyerWallet.sendTransaction({
      to: this.ownerWallet.address,
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

      const proofCid = await this.ipfsStorage.putObject(proof);
      const tokenCids = monsterCards.concat(equipmentCards).map((c) => c.cid);

      const buyStarterPackTx = await this.ethClient.contract.buyStarterPack(
        buyerWallet.address,
        tokenCids,
        proofCid,
      );
      const receipt = await buyStarterPackTx.wait();

      const createdTokenIds = getTokenIdsFromReceipt(receipt);

      return this.findCardTokens(createdTokenIds);
    } catch (e) {
      await this.ownerWallet.sendTransaction({
        to: buyerWallet.address,
        value: fee,
      });

      throw new InternalServerErrorException();
    }
  }

  async getCardTokensFromToken(
    tokens: ContractToken[],
  ): Promise<CardTokenModel[]> {
    const tokenCids = tokens.map((token) => token.uri);
    const cards = await this.cardModel
      .find({
        cid: {
          $in: tokenCids,
        },
      })
      .exec();
    const cardsByCidMap = cards.reduce(
      (memo, current) => ({
        ...memo,
        [current.cid]: current,
      }),
      {},
    );

    return tokens.map(({ id, uri }) => ({
      tokenId: id.toHexString(),
      ...cardsByCidMap[uri].toObject(),
    }));
  }

  async findCardTokens(ids: BigNumber[]): Promise<CardTokenModel[]> {
    const tokens = await this.contract.tokensIn(ids);

    return this.getCardTokensFromToken(tokens);
  }

  async getCardTokensOfUser(user: User) {
    const wallet = this.ethClient.getWalletOfUser(user);
    const tokens = await this.contract.tokensOf(wallet.address);

    return this.getCardTokensFromToken(tokens);
  }

  async getRandomCardsWithRandomValue(
    seed: string,
    type: CardType,
    count = 1,
    maxLevel = 8,
    maxRareLevel = RareLevel.ELITE,
  ) {
    const rng = createRng(seed);
    const maxInt = await this.getMaxCardSeed();
    const randoms = [];
    const cards: Card[] = [];
    const acceptRareLevels = RareLevels.slice(
      0,
      RareLevels.indexOf(maxRareLevel) + 1,
    );

    do {
      const ranNum = nextInt(rng, maxInt);
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
    } while (cards.length < count);

    return {
      randoms,
      cards,
    };
  }
}
