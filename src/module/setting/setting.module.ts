import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Setting, SettingSchema } from './schema/setting.schema';

@Module({
  providers: [SettingService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Setting.name,
        schema: SettingSchema,
      },
    ]),
  ],
  exports: [SettingService],
})
export class SettingModule {}
