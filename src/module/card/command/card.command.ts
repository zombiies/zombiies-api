import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { InjectIpfsClient, createBlobFromObject } from '../../../lib/ipfs';
import * as fs from 'fs';
import { Card } from '../schema/card.schema';
import { CardService } from '../card.service';
import { Promise } from 'mongoose';
import { SettingService } from '../../setting/setting.service';
import { NFTStorage } from 'nft.storage';

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
    const cardsRaw = fs.readFileSync(__dirname + '/cards-seed.json', 'utf-8');
    const cardsData: Card[] = JSON.parse(cardsRaw);
    await this.cardService.deleteAll();
    await this.doParallelJob<Card>(cardsData, 50, this.doSeed.bind(this));
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
