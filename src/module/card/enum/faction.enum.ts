import { registerEnumType } from '@nestjs/graphql';

export enum Faction {
  CHAOS = 'CHAOS',
  NATURE = 'NATURE',
  BALANCE = 'BALANCE',
  FORTUNE = 'FORTUNE',
  WAR = 'WAR',
  NEUTRAL = 'NEUTRAL',
}

registerEnumType(Faction, {
  name: 'Faction',
});
