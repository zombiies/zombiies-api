import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CardTokenModel } from '../../card/model/card-token.model';

@ObjectType()
export class DeckCardModel extends CardTokenModel {
  @Field((type) => Int)
  position: number;
}
