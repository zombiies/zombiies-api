import { Module } from '@nestjs/common';
import { DeckService } from './deck.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Deck, DeckSchema } from './schema/deck.schema';
import { CardModule } from '../card/card.module';
import { DeckResolver } from './deck.resolver';

@Module({
  providers: [DeckService, DeckResolver],
  imports: [
    MongooseModule.forFeature([
      {
        name: Deck.name,
        schema: DeckSchema,
      },
    ]),
    CardModule,
  ],
})
export class DeckModule {}
