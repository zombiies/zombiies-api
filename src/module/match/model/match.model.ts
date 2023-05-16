import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PlayerStatusModel } from './player-status.model';

@ObjectType()
export class MatchModel {
  @Field((type) => ID)
  id?: string;

  playerStatuses: PlayerStatusModel[];
  winnerId?: string;
}
