import { InputType } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize } from 'class-validator';

@InputType()
export class LevelUpCardInput {
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  sacrificeTokenIds: string[];
}
