import { registerEnumType } from '@nestjs/graphql';

export enum PlayerTurn {
  PLAYER1 = 'PLAYER1',
  PLAYER2 = 'PLAYER2',
}

registerEnumType(PlayerTurn, {
  name: 'PlayerTurn',
});
