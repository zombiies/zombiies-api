import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { DeckModel } from './model/deck.model';
import { DeckDocument } from './schema/deck.schema';
import { DeckCardModel } from './model/deck-card.model';
import { DeckService } from './deck.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { DeckInput } from './input/deck.input';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { TokenInDeckInput } from './input/token-in-deck.input';
import { BigNumber } from 'ethers';

@Resolver((of) => DeckModel)
export class DeckResolver {
  constructor(private readonly service: DeckService) {}

  @Mutation((returns) => DeckModel)
  @UseGuards(JwtAuthGuard)
  async createDeck(
    @CurrentUser() user: UserDocument,
    @Args('input') input: DeckInput,
  ) {
    const { name } = input;

    return this.service.createDeck(user, name);
  }

  @Mutation((returns) => DeckModel)
  @UseGuards(JwtAuthGuard)
  async updateDeck(
    @CurrentUser() user: UserDocument,
    @Args('input') input: DeckInput,
    @Args({ name: 'deckId', type: () => String })
    deckId: string,
  ) {
    const { name } = input;

    return this.service.updateDeck(user, deckId, name);
  }

  @Mutation((returns) => DeckModel)
  @UseGuards(JwtAuthGuard)
  async deleteDeck(
    @CurrentUser() user: UserDocument,
    @Args({ name: 'deckId', type: () => String })
    deckId: string,
  ) {
    return this.service.deleteDeck(user, deckId);
  }

  @Mutation((returns) => DeckModel)
  @UseGuards(JwtAuthGuard)
  async addCardToDeck(
    @CurrentUser() user: UserDocument,
    @Args('input') input: TokenInDeckInput,
  ) {
    const { deckId, tokenId } = input;

    return this.service.addCardToDeck(user, BigNumber.from(tokenId), deckId);
  }

  @Mutation((returns) => DeckModel)
  @UseGuards(JwtAuthGuard)
  async removeCardFromDeck(
    @CurrentUser() user: UserDocument,
    @Args('input') input: TokenInDeckInput,
  ) {
    const { deckId, tokenId } = input;

    return this.service.removeCardFromDeck(
      user,
      BigNumber.from(tokenId),
      deckId,
    );
  }

  @Query((returns) => [DeckModel])
  @UseGuards(JwtAuthGuard)
  async ownedDecks(@CurrentUser() user: UserDocument) {
    return this.service.ownedDecks(user);
  }

  @Query((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async isCardInDeck(
    @CurrentUser() user: UserDocument,
    @Args('input') input: TokenInDeckInput,
  ) {
    const { deckId, tokenId } = input;

    return this.service.isCardInDeck(user, BigNumber.from(tokenId), deckId);
  }

  @ResolveField()
  async cards(@Parent() parent: DeckDocument): Promise<DeckCardModel[]> {
    const { deckCards } = parent;

    return this.service.getDeckCardModels(deckCards);
  }
}
