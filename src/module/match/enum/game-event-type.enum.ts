import { registerEnumType } from '@nestjs/graphql';

export enum GameEventType {
  PUT_CARD = 'PUT_CARD',
  DENY_CARD = 'DENY_CARD',
  CRYSTAL_CHANGED = 'CRYSTAL_CHANGED',
  ATTACK = 'ATTACK',
  HP_LOST = 'HP_LOST',
  CARD_DESTROY = 'CARD_DESTROY',
}

registerEnumType(GameEventType, {
  name: 'GameEventType',
});
