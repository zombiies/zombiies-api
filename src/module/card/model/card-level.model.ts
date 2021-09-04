import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CardSkill } from '../schema/card.schema';
import { CardSkillModel } from './card-skill.model';

@ObjectType()
export class CardLevelModel {
  @Field((type) => Int)
  level: number;

  @Field((type) => [CardSkillModel])
  skills: CardSkill[];
}
