import { registerEnumType } from '@nestjs/graphql';

export enum PrepareTurnEventType {
  PUT_CARD = 'PUT_CARD',
  DENY_CARD = 'DENY_CARD',
}

registerEnumType(PrepareTurnEventType, {
  name: 'PrepareTurnEventType',
});
