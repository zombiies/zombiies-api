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
