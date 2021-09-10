import { InputType } from '@nestjs/graphql';

@InputType()
export class TokenInDeckInput {
  tokenId: string;
  deckId: string;
}
