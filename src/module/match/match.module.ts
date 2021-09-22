import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './schema/match.schema';
import { DeckModule } from '../deck/deck.module';
import { MatchResolver } from './match.resolver';
import { User, UserSchema } from '../user/schema/user.schema';

@Module({
  providers: [MatchService, MatchResolver],
  imports: [
    MongooseModule.forFeature([
      {
        name: Match.name,
        schema: MatchSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    DeckModule,
  ],
  exports: [MatchService],
})
export class MatchModule {}
