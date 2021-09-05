import { Module } from '@nestjs/common';
import { EtherClientService } from './ether-client.service';

@Module({
  providers: [EtherClientService],
  exports: [EtherClientService],
})
export class EtherClientModule {}
