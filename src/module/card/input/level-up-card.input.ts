import { InputType } from '@nestjs/graphql';
import { Length } from 'class-validator';

@InputType()
export class LevelUpCardInput {
  @Length(2, 2)
  sacrificeTokenIds: string[];
}
