import { Field, ObjectType } from '@nestjs/graphql';
import { CardSkillModel } from '../../card/model/card-skill.model';
import { BoardCardModel } from './board-card.model';

@ObjectType()
export class AttackEventModel {
  tokenId: string;
  toPosition: number;

  @Field((type) => CardSkillModel)
  skill: CardSkillModel;

  damage: number;
  destroy: boolean;

  targetOnBoard: BoardCardModel[];
}
