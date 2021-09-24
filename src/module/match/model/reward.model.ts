import { Field, ObjectType } from '@nestjs/graphql';
import { CardTokenModel } from '../../card/model/card-token.model';

@ObjectType()
export class RewardModel {
  @Field((type) => CardTokenModel)
  token: CardTokenModel;

  playerId: string;
}
