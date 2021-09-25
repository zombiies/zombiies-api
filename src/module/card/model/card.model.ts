import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { RareLevel } from '../enum/rare-level.enum';
import { Faction } from '../enum/faction.enum';
import { CardType } from '../enum/card-type.enum';
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
  tokenUri: string;

  @Field((type) => Int)
  level: number;

  skills: CardSkillModel[];
}
