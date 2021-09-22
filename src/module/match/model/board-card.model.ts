import { Field, ObjectType } from '@nestjs/graphql';
import { CardTokenModel } from '../../card/model/card-token.model';

@ObjectType()
export class BoardCardModel extends CardTokenModel {
  @Field((type) => [CardTokenModel])
  equipment?: CardTokenModel;
}
