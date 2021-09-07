import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './schema/card.schema';
import { CardCommand } from './command/card.command';
import { CardResolver } from './card.resolver';
import { EtherClientModule } from '../ether-client/ether-client.module';

@Module({
  providers: [CardService, CardCommand, CardResolver],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Card.name,
        useFactory: () => {
          const schema = CardSchema;
          schema.index({ name: 1, faction: 1, level: 1 }, { unique: true });

          return schema;
        },
      },
    ]),
    EtherClientModule,
  ],
  exports: [CardService],
})
export class CardModule {}
