import { registerEnumType } from '@nestjs/graphql';

export enum RareLevel {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  ELITE = 'ELITE',
}

registerEnumType(RareLevel, {
  name: 'RareLevel',
});

export const RareLevels = [
  RareLevel.COMMON,
  RareLevel.RARE,
  RareLevel.EPIC,
  RareLevel.LEGENDARY,
  RareLevel.ELITE,
];
