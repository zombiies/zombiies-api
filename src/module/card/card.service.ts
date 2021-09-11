import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CardDocument } from './schema/card.schema';
import { FilterQuery, Model, Promise } from 'mongoose';
import { User, UserDocument } from '../user/schema/user.schema';
import { CardType } from './enum/card-type.enum';
import { RareLevel, RareLevels } from './enum/rare-level.enum';
import {
  cidToUri,
  InjectIpfsStorage,
  IpfsStorage,
} from '../../lib/ipfs-storage';
import { getTokenIdsFromReceipt } from '../../util/contract';
import { EtherClientService } from '../ether-client/ether-client.service';
import { BigNumber } from 'ethers';
import { CardTokenModel } from './model/card-token.model';
import { ContractToken } from './interface/contract-token.interface';
import { createRng, nextInt } from '../../util/random';
import { allStringsEqual } from '../../util/string';

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

  async getNextLevelCard(card: CardTokenModel) {
    const { level, name } = card;

    return this.cardModel
      .findOne({
        level: level + 1,
        name,
      })
      .exec();
  }

  async levelUpCard(user: User, sacrificeTokenIds: BigNumber[]) {
    const userWallet = this.ethClient.getWalletOfUser(user);

    await Promise.all(
      sacrificeTokenIds.map(async (id) => {
        if (!(await this.ethClient.isOwnerOf(userWallet.address, id))) {
          throw new ForbiddenException(
            `You do not have permission with this token`,
          );
        }
      }),
    );

    const sacrificeCards = await this.findCardTokens(sacrificeTokenIds);

    if (sacrificeCards.length !== 2) {
      throw new BadRequestException('Must combine two cards to level up');
    }

    if (!allStringsEqual(...sacrificeCards.map((c) => c.tokenUri))) {
      throw new BadRequestException(
        'All sacrifice cards must be same type and level',
      );
    }

    const nextLevelCard = await this.getNextLevelCard(sacrificeCards[0]);

    if (!nextLevelCard) {
      throw new BadRequestException('Can not level up these cards');
    }

    const proof = {
      sacrificeTokenIds,
      nextLevelTokenUri: nextLevelCard.tokenUri,
    };
    const proofCid = await this.ipfsStorage.putObject(proof);
    const proofUri = cidToUri(proofCid);

    const tx = await this.contract.levelUp(
      userWallet.address,
      sacrificeTokenIds,
      nextLevelCard.tokenUri,
      proofUri,
    );
    const receipt = await tx.wait();
    const newTokenId = getTokenIdsFromReceipt(
      receipt,
      (_from, to) => to === userWallet.address,
    )[0];

    const nextLevelCardToken = await this.findOneCardToken(newTokenId);

    if (!nextLevelCardToken) {
      throw new InternalServerErrorException('Unknown error, please try later');
    }

    return nextLevelCardToken;
  }

  async getMintFee() {
    return this.contract.getMintFee();
  }

  async canMint(user: User, type: CardType) {
    const ownedTokens = await this.getCardTokensOfUser(user, type);

    return ownedTokens.length < 8;
  }

  async mint(user: User, type: CardType) {
    if (!(await this.canMint(user, type))) {
      throw new BadRequestException(
        'Can buy new card only if you have less than 8 cards',
      );
    }

    const wallet = this.ethClient.getWalletOfUser(user);
    const fee = await this.getMintFee();
    const buyTx = await wallet.sendTransaction({
      to: this.ownerWallet.address,
      value: fee,
    });
    const buyReceipt = await buyTx.wait();
    const buyTxHash = buyReceipt.transactionHash;

    try {
      const { randoms, cards } = await this.getRandomCardsWithRandomValue(
        buyTxHash,
        CardType.MONSTER,
        1,
        1,
        RareLevel.COMMON,
      );

      const proof = {
        transactionHash: buyTxHash,
        randoms,
        cards,
      };
      const proofCid = await this.ipfsStorage.putObject(proof);
      const proofUri = cidToUri(proofCid);

      const tokenUri = cards[0].tokenUri;
      const mintTx = await this.contract.safeMint(
        wallet.address,
        tokenUri,
        proofUri,
      );
      const mintReceipt = await mintTx.wait();

      const createdTokenId = getTokenIdsFromReceipt(mintReceipt)[0];

      return this.findOneCardToken(createdTokenId);
    } catch (e) {
      await this.ownerWallet.sendTransaction({
        to: wallet.address,
        value: fee,
      });

      throw e;
    }
  }

  async getCardTokensFromToken(
    tokens: ContractToken[],
    type?: CardType,
  ): Promise<CardTokenModel[]> {
    const tokenUris = tokens.map((token) => token.uri);
    const types = type ? [type] : [CardType.MONSTER, CardType.EQUIPMENT];
    const cards = await this.cardModel
      .find({
        tokenUri: {
          $in: tokenUris,
        },
        type: {
          $in: types,
        },
      })
      .exec();
    const cardsByUriMap = cards.reduce(
      (memo, current) => ({
        ...memo,
        [current.tokenUri]: current,
      }),
      {},
    );

    return tokens
      .filter(({ uri }) => cardsByUriMap[uri])
      .map(({ id, uri }) => ({
        tokenId: id.toHexString(),
        ...cardsByUriMap[uri].toObject(),
      }));
  }

  async findCardTokens(ids: BigNumber[]): Promise<CardTokenModel[]> {
    const tokens = await this.contract.tokensIn(ids);

    return this.getCardTokensFromToken(tokens);
  }

  async findOneCardToken(id: BigNumber): Promise<CardTokenModel | undefined> {
    const tokens = await this.findCardTokens([id]);

    return tokens[0];
  }

  async getCardTokensOfUser(user: User, type?: CardType) {
    const wallet = this.ethClient.getWalletOfUser(user);
    const tokens = await this.contract.tokensOf(wallet.address);

    return this.getCardTokensFromToken(tokens, type);
  }

  async getRandomCardsWithRandomValue(
    seed: string,
    type: CardType,
    count = 1,
    maxLevel = 8,
    maxRareLevel = RareLevel.ELITE,
  ): Promise<{
    randoms: Array<{
      value: number;
      take: boolean;
    }>;
    cards: CardDocument[];
  }> {
    const rng = createRng(seed);
    const maxInt = await this.getMaxCardSeed();
    const randoms = [];
    const cards: CardDocument[] = [];
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

  async findAndCheckTokenByUser(user: UserDocument, tokenId: BigNumber) {
    const token = await this.findOneCardToken(tokenId);
    const wallet = this.ethClient.getWalletOfUser(user);

    if (!(await this.ethClient.isOwnerOf(wallet.address, tokenId))) {
      throw new ForbiddenException(
        'You do not have permission to do this action',
      );
    }

    return token;
  }
}
