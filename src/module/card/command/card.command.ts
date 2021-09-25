import { Injectable } from '@nestjs/common';
import { Command, Positional } from 'nestjs-command';
import {
  cidToUri,
  InjectIpfsStorage,
  IpfsStorage,
} from '../../../lib/ipfs-storage';
import { Card } from '../schema/card.schema';
import { CardService } from '../card.service';
import { Promise } from 'mongoose';
import * as cardsSeed from './cards-seed.json';
import { RareLevel } from '../enum/rare-level.enum';
import { Faction } from '../enum/faction.enum';
import { CardType } from '../enum/card-type.enum';
import { EtherClientService } from '../../ether-client/ether-client.service';
import { parseEther } from 'nestjs-ethers';
import { CardSkillModel } from '../model/card-skill.model';

interface CardSeed {
  name: string;
  cost: number;
  rareLevel: RareLevel;
  faction: Faction;
  type: CardType;
  levels: Array<{
    level: number;
    skills: CardSkillModel[];
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

  get contract() {
    return this.ethClient.contract;
  }

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
    await this.doParallelJob<Omit<Card, 'tokenUri'>>(
      cards,
      100,
      this.doSeed.bind(this),
    );
    await this.pinFactory();
  }

  async pinFactory() {
    const factoryData = (await this.cardService.getAllCard()).map(
      ({ tokenUri }) => tokenUri,
    );

    const cid = await this.ipfsStorage.putObject(factoryData);
    const ipfsUri = cidToUri(cid);

    await (await this.contract.setFactoryURI(ipfsUri)).wait();
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
        const cid = await this.ipfsStorage.putObject(cardData);

        await this.cardService.createCard({
          ...cardData,
          tokenUri: cidToUri(cid),
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
    command: 'card:set-mint-fee <fee>',
    describe: 'Set mint fee',
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
    await this.contract.setMintFee(parseEther(fee));
  }

  @Command({
    command: 'card:set-factory-uri <uri>',
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
    await this.contract.setFactoryURI(uri);
  }
}
