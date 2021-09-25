import { ObjectType } from '@nestjs/graphql';
import { CardTokenModel } from '../../card/model/card-token.model';

@ObjectType()
export class RewardModel {
  token: CardTokenModel;

  playerId: string;
}
