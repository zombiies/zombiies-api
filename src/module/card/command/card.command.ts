import { Injectable } from '@nestjs/common';
import { Command, Positional } from 'nestjs-command';
import { InjectIpfsStorage, IpfsStorage } from '../../../lib/ipfs-storage';
import { Card, CardSkill } from '../schema/card.schema';
import { CardService } from '../card.service';
import { Promise } from 'mongoose';
import * as cardsSeed from './cards-seed.json';
import { RareLevel } from '../enum/rare-level.enum';
import { Faction } from '../enum/faction.enum';
import { CardType } from '../enum/card-type.enum';
import { EtherClientService } from '../../ether-client/ether-client.service';
import { parseEther } from 'nestjs-ethers';
import { BigNumber } from 'ethers';

interface CardSeed {
  name: string;
  cost: number;
  rareLevel: RareLevel;
  faction: Faction;
  type: CardType;
  levels: Array<{
    level: number;
    skills: CardSkill[];
  }>;
  startSeed: number;
  endSeed: number;
  totalSeeds: number;
}

@Injectable()
export class CardCommand {
  constructor(
    @InjectIpfsStorage() private readonly ipfsStorage: IpfsStorage,
    private readonly cardService: CardService,
    private readonly ethClient: EtherClientService,
  ) {}

  @Command({
    command: 'card:seed',
    describe: 'seed cards',
  })
  async seed() {
    const cards = (cardsSeed as CardSeed[]).flatMap((card) =>
      card.levels.map((levelAttr) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { levels, ...cardAttrs } = card;

        return {
          ...cardAttrs,
          ...levelAttr,
        };
      }),
    );

    await this.cardService.deleteAll();
    await this.doParallelJob<Omit<Card, 'cid'>>(
      cards,
      100,
      this.doSeed.bind(this),
    );
    await this.pinFactory();
  }

  async pinFactory() {
    const factoryData = (await this.cardService.getAllCard()).map(
      ({ cid }) => cid,
    );

    const uri = await this.ipfsStorage.putObject(factoryData);

    await (await this.ethClient.getContract().setFactoryURI(uri)).wait();
  }

  private seededCount: number;
  private totalSeeds: number;

  async doParallelJob<T>(
    cardsData: T[],
    numsOfJob: number,
    job: (data: T[]) => Promise<T[]>,
  ) {
    this.seededCount = 0;
    this.totalSeeds = cardsData.length;
    const numsPerJob = Math.ceil(cardsData.length / numsOfJob);
    const dataChunks = Array.from({ length: numsOfJob }, (_, v) => v).reduce(
      (memo, current, index) => [
        ...memo,
        cardsData.slice(index * numsPerJob, index * numsPerJob + numsPerJob),
      ],
      [] as Array<T[]>,
    );

    await Promise.all(
      dataChunks.map(async (cardsDataPerJob) => {
        await job(cardsDataPerJob);
      }),
    );
  }

  async doSeed(cardsData: Card[]) {
    for (const cardData of cardsData) {
      try {
        const hash = await this.ipfsStorage.putObject(cardData);

        await this.cardService.createCard({
          ...cardData,
          cid: hash,
        });
      } catch (e) {
        console.log('======');
        console.log(cardData);
        throw e;
      }

      this.seededCount++;

      console.clear();
      console.log(`Seeded ${this.seededCount}/${this.totalSeeds}`);
    }
  }

  @Command({
    command: 'card:pack_fee:set <fee>',
    describe: 'Set starter pack fee',
  })
  async setStarterPackFee(
    @Positional({
      name: 'fee',
      describe: 'new fee',
      type: 'string',
      default: 0.005,
    })
    fee: string,
  ) {
    await this.ethClient.getContract().setStarterPackFee(parseEther(fee));
  }

  @Command({
    command: 'card:factory_uri:set <uri>',
    describe: 'Set factory uri',
  })
  async setFactoryUri(
    @Positional({
      name: 'uri',
      describe: 'new uri',
      type: 'string',
    })
    uri: string,
  ) {
    await this.ethClient.getContract().setFactoryURI(uri);
  }

  @Command({
    command: 'card:level_up_count:set <count>',
    describe: 'Set count of card to level up',
  })
  async setLevelUpCount(
    @Positional({
      name: 'count',
      describe: 'new count',
      type: 'number',
    })
    count: number,
  ) {
    await this.ethClient.getContract().setCountToLevelUp(BigNumber.from(count));
  }
}
