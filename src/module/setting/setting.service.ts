import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Setting, SettingDocument } from './schema/setting.schema';
import { Model } from 'mongoose';

@Injectable()
export class SettingService {
  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {}

  private static get defaultSetting(): Setting {
    return {
      maxRandomValue: 20798440000,
    };
  }

  async getSetting(): Promise<Setting> {
    const settings: Setting[] = await this.settingModel.find();

    if (settings.length > 0) {
      return {
        ...SettingService.defaultSetting,
        ...settings[0],
      };
    }

    return SettingService.defaultSetting;
  }

  async setSetting(options: Partial<Setting>): Promise<Setting> {
    const oldSettings = await this.getSetting();

    await this.settingModel.deleteMany();
    const newSetting = new this.settingModel({
      ...oldSettings,
      ...options,
    });

    return newSetting.save();
  }
}
