import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { RareLevel } from '../enum/rare-level.enum';
import { Faction } from '../enum/faction.enum';
import { CardType } from '../enum/card-type.enum';
import { CardLevelModel } from './card-level.model';
import { CardLevel } from '../schema/card.schema';

@ObjectType()
export class CardModel {
  @Field((type) => ID)
  id: string;
  name: string;

  @Field((type) => Int)
  cost: number;
  rareLevel: RareLevel;
  faction: Faction;
  type: CardType;
  cid: string;

  @Field((type) => [CardLevelModel])
  levels: CardLevel[];
}
