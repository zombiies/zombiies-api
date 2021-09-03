import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './schema/card.schema';
import { CardLevel, CardLevelSchema } from './schema/card-level.schema';
import { CardSkill, CardSkillSchema } from './schema/card-skill.schema';

@Module({
  providers: [CardService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Card.name,
        schema: CardSchema,
      },
      {
        name: CardLevel.name,
        schema: CardLevelSchema,
      },
      {
        name: CardSkill.name,
        schema: CardSkillSchema,
      },
    ]),
  ],
})
export class CardModule {}
