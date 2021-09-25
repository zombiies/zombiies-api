import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CardSkillModel } from '../../card/model/card-skill.model';
import { BoardCardModel } from './board-card.model';

@ObjectType()
export class AttackEventModel {
  tokenId: string;
  @Field((type) => Int)
  toPosition: number;

  @Field((type) => CardSkillModel)
  skill: CardSkillModel;

  @Field((type) => Int)
  damage: number;
  destroy: boolean;

  targetOnBoard: BoardCardModel[];
}
