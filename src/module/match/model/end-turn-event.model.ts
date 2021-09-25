import { ObjectType } from '@nestjs/graphql';
import { MatchModel } from './match.model';

@ObjectType()
export class EndTurnEventModel {
  playerId: string;

  currentMatchStatus: MatchModel;
}
