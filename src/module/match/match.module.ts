import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './schema/match.schema';
import { DeckModule } from '../deck/deck.module';
import { MatchResolver } from './match.resolver';
import { BullModule } from '@nestjs/bull';
import { MATCH_QUEUE } from '../../config/bull/queue.constant';
import { MatchConsumer } from './consumer/match.consumer';
import { CardModule } from '../card/card.module';

@Module({
  providers: [MatchService, MatchResolver, MatchConsumer],
  imports: [
    MongooseModule.forFeature([
      {
        name: Match.name,
        schema: MatchSchema,
      },
    ]),
    BullModule.registerQueue({
      name: MATCH_QUEUE,
    }),
    DeckModule,
    CardModule,
  ],
  exports: [MatchService],
})
export class MatchModule {}
