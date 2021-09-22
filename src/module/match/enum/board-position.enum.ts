import { registerEnumType } from '@nestjs/graphql';

export enum BoardPosition {
  POSITION1 = 'POSITION1',
  POSITION2 = 'POSITION2',
  POSITION3 = 'POSITION3',
}

registerEnumType(BoardPosition, {
  name: 'BoardPosition',
});
