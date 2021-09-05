import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { InjectIpfsClient, createBlobFromObject } from '../../../lib/ipfs';
import { Card, CardSkill } from '../schema/card.schema';
import { CardService } from '../card.service';
import { Promise } from 'mongoose';
import { SettingService } from '../../setting/setting.service';
import { NFTStorage } from 'nft.storage';
import * as cardsSeed from './cards-seed.json';
import { RareLevel } from '../enum/rare-level.enum';
import { Faction } from '../enum/faction.enum';
import { CardType } from '../enum/card-type.enum';

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
    @InjectIpfsClient() private readonly ipfsClient: NFTStorage,
    private readonly cardService: CardService,
    private readonly settingService: SettingService,
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
      50,
      this.doSeed.bind(this),
    );
    await this.pinFactory();
  }

  async pinFactory() {
    const factoryData = (await this.cardService.getAllCard()).map((card) => {
      const { _id, __v, ...cardAttrs } = card.toObject();

      return cardAttrs;
    });

    const factoryCid = await this.ipfsClient.storeBlob(
      createBlobFromObject(factoryData),
    );

    await this.settingService.setSetting({
      cardsFactoryCid: factoryCid,
    });
  }

  async doParallelJob<T>(
    cardsData: T[],
    numsOfJob: number,
    job: (data: T[], jobIdx: number) => Promise<T[]>,
  ) {
    const numsPerJob = Math.ceil(cardsData.length / numsOfJob);
    const dataChunks = Array.from({ length: numsOfJob }, (_, v) => v).reduce(
      (memo, current, index) => [
        ...memo,
        cardsData.slice(index * numsPerJob, index * numsPerJob + numsPerJob),
      ],
      [] as Array<T[]>,
    );

    await Promise.all(
      dataChunks.map(async (cardsDataPerJob, index) => {
        await job(cardsDataPerJob, index + 1);
      }),
    );
  }

  async doSeed(cardsData: Card[], jobIdx: number) {
    let count = 0;

    for (const cardData of cardsData) {
      const cid = await this.ipfsClient.storeBlob(
        createBlobFromObject(cardData),
      );

      await this.cardService.createCard({
        ...cardData,
        cid,
      });

      count++;
      console.log(`${jobIdx}: ${count}/${cardsData.length}`);
    }
  }
}
