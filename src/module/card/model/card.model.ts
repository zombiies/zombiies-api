import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { RareLevel } from '../enum/rare-level.enum';
import { Faction } from '../enum/faction.enum';
import { CardType } from '../enum/card-type.enum';
import { CardSkill } from '../schema/card.schema';
import { CardSkillModel } from './card-skill.model';

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

  @Field((type) => Int)
  level: number;

  @Field((type) => [CardSkillModel])
  skills: CardSkill[];
}
