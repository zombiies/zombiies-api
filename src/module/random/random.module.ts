import { Module } from '@nestjs/common';
import { RandomService } from './random.service';
import { SettingModule } from '../setting/setting.module';

@Module({
  providers: [RandomService],
  imports: [SettingModule],
  exports: [RandomService],
})
export class RandomModule {}
