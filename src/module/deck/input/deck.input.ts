import { InputType } from '@nestjs/graphql';
import { Length } from 'class-validator';

@InputType()
export class DeckInput {
  @Length(4, 12)
  name: string;
}
