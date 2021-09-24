import { registerEnumType } from '@nestjs/graphql';

export enum PrepareTurnEventType {
  PUT_CARD = 'PUT_CARD',
  DENY_CARD = 'DENY_CARD',
  END_TURN = 'END_TURN',
}

registerEnumType(PrepareTurnEventType, {
  name: 'PrepareTurnEventType',
});
