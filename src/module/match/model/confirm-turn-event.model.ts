import { Field, ObjectType } from '@nestjs/graphql';
import { MatchModel } from './match.model';
import { AttackEventModel } from './attack-event.model';

@ObjectType()
export class ConfirmTurnEventModel {
  playerId: string;

  @Field((type) => [AttackEventModel])
  attacks: AttackEventModel[];

  @Field((type) => MatchModel)
  currentMatchStatus: MatchModel;
}
