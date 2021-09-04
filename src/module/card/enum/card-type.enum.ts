import { registerEnumType } from '@nestjs/graphql';

export enum CardType {
  MONSTER = 'MONSTER',
  EQUIPMENT = 'EQUIPMENT',
}

registerEnumType(CardType, {
  name: 'CardType',
});
