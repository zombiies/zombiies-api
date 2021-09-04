import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { InjectPinata } from '../../../lib/pinata/pinata.decorator';
import { PinataClient } from '@pinata/sdk';
import * as fs from 'fs';
import { Card } from '../schema/card.schema';
import { CardService } from '../card.service';
import { Promise } from 'mongoose';
import { SettingService } from '../../setting/setting.service';

@Injectable()
export class CardCommand {
  constructor(
    @InjectPinata() private readonly pinata: PinataClient,
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
    await this.doParallelJob(cardsData, 20, this.doSeed.bind(this));
  }

  @Command({
    command: 'card:pin:factory',
    describe: 'pin factory',
  })
  async pinFactory() {
    const factoryData = (await this.cardService.getAllCard()).map((card) => {
      const { _id, __v, ...cardAttrs } = card.toObject();

      return cardAttrs;
    });

    const factoryPin = await this.pinata.pinJSONToIPFS(factoryData, {
      pinataMetadata: {
        name: 'Factory',
        keyvalues: {
          type: 'FACTORY',
        } as any,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    });
    await this.settingService.setSetting({
      factoryIpfsHash: factoryPin.IpfsHash,
    });
  }

  async doParallelJob(
    cardsData: Card[],
    numsOfJob: number,
    job: (data: Card[], jobIdx: number) => Promise<Card[]>,
  ) {
    const numsPerJob = Math.ceil(cardsData.length / numsOfJob);
    const dataChunks = Array.from({ length: numsOfJob }, (_, v) => v).reduce(
      (memo, current, index) => [
        ...memo,
        cardsData.slice(index * numsPerJob, index * numsPerJob + numsPerJob),
      ],
      [] as Array<Card[]>,
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
      const pin = await this.pinata.pinJSONToIPFS(cardData, {
        pinataMetadata: {
          name: `[${cardData.faction}] ${cardData.name}`,
          keyvalues: {
            type: 'CARD',
          } as any,
        },
        pinataOptions: {
          cidVersion: 1,
        },
      });

      await this.cardService.createCard({
        ...cardData,
        ipfsHash: pin.IpfsHash,
      });

      count++;
      console.log(`${jobIdx}: ${count}/${cardsData.length}`);
    }
  }
}
