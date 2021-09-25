import { ObjectType } from '@nestjs/graphql';
import { MatchModel } from './match.model';
import { AttackEventModel } from './attack-event.model';

@ObjectType()
export class ConfirmTurnEventModel {
  playerId: string;

  attacks: AttackEventModel[];

  currentMatchStatus: MatchModel;
}
