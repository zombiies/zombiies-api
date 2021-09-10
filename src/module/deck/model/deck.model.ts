import { Field, ID, ObjectType } from '@nestjs/graphql';
import { DeckCardModel } from './deck-card.model';

@ObjectType()
export class DeckModel {
  @Field((type) => ID)
  id: string;

  name: string;

  @Field((type) => [DeckCardModel])
  cards: DeckCardModel[];
}
