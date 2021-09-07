import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { CardModel } from './model/card.model';
import { CardDocument } from './schema/card.schema';
import { CardService } from './card.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User } from '../user/schema/user.schema';
import { CardTokenModel } from './model/card-token.model';

@Resolver((of) => CardModel)
export class CardResolver {
  constructor(private readonly service: CardService) {}

  @Query((returns) => [CardModel])
  async allCards(): Promise<CardDocument[]> {
    return this.service.getAllCard();
  }

  @Mutation((returns) => [CardTokenModel])
  @UseGuards(JwtAuthGuard)
  async buyStarterPack(@CurrentUser() currentUser: User) {
    return this.service.buyStarterPack(currentUser);
  }

  @Query((returns) => [CardTokenModel])
  @UseGuards(JwtAuthGuard)
  async ownedCardTokens(@CurrentUser() currentUser: User) {
    return this.service.getCardTokensOfUser(currentUser);
  }
}
