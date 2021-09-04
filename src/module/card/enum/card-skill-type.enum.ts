import { registerEnumType } from '@nestjs/graphql';

export enum CardSkillType {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  MAGIC = 'MAGIC',
  RANDOM = 'RANDOM',
  HP = 'HP',
  ARMOR = 'ARMOR',
}

registerEnumType(CardSkillType, {
  name: 'CardSkillType',
});
