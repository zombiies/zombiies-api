import { Field, ObjectType } from '@nestjs/graphql';
import { MatchModel } from './match.model';

@ObjectType()
export class EndTurnEventModel {
  playerId: string;

  @Field((type) => MatchModel)
  currentMatchStatus: MatchModel;
}
