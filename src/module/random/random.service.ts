import { Injectable } from '@nestjs/common';
import { SettingService } from '../setting/setting.service';
import * as seedrandom from 'seedrandom';

@Injectable()
export class RandomService {
  constructor(private readonly settingService: SettingService) {}

  private async getMaxRandInt() {
    return (await this.settingService.getSetting()).maxRandomValue;
  }

  createRng(seed: string): any {
    return seedrandom(seed);
  }

  async getRandomNumber(rng: any, max?: number) {
    const maxInt = max || (await this.getMaxRandInt());

    return Math.floor(rng() * maxInt);
  }
}
