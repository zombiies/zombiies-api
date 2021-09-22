import { Field, ObjectType } from '@nestjs/graphql';
import { BoardCardModel } from './board-card.model';

@ObjectType()
export class BoardModel {
  @Field((type) => BoardCardModel)
  position1?: BoardCardModel;

  @Field((type) => BoardCardModel)
  position2?: BoardCardModel;

  @Field((type) => BoardCardModel)
  position3?: BoardCardModel;
}
