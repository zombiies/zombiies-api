import { Query, Resolver } from '@nestjs/graphql';
import { CardModel } from './model/card.model';
import { CardDocument } from './schema/card.schema';
import { CardService } from './card.service';

@Resolver((of) => CardModel)
export class CardResolver {
  constructor(private readonly cardService: CardService) {}

  @Query((returns) => [CardModel])
  async allCards(): Promise<CardDocument[]> {
    return this.cardService.getAllCard();
  }
}
