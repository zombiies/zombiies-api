import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PrepareTurnEventType } from '../enum/prepare-turn-event-type.enum';
import { MatchModel } from './match.model';

@ObjectType()
export class PrepareTurnEventModel {
  type: PrepareTurnEventType;

  playerId: string;
  tokenId: string;

  @Field((type) => Int)
  toPosition?: number;

  currentMatchStatus: MatchModel;
}
