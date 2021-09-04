import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CardSkillType } from '../enum/card-skill-type.enum';

@ObjectType()
export class CardSkillModel {
  type: CardSkillType;

  @Field((type) => Int)
  value: number;
}
