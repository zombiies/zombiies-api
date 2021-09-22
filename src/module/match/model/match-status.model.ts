import { ObjectType, PickType } from '@nestjs/graphql';
import { MatchModel } from './match.model';

@ObjectType()
export class MatchStatusModel extends PickType(MatchModel, [
  'player1Board',
  'player2Board',
  'player1Crystal',
  'playerCrystal',
  'player1Cards',
  'player2Cards',
  'id',
] as const) {}
