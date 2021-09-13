import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CardModel } from './model/card.model';
import { CardDocument } from './schema/card.schema';
import { CardService } from './card.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User } from '../user/schema/user.schema';
import { CardTokenModel } from './model/card-token.model';
import { LevelUpCardInput } from './input/level-up-card.input';
import { BigNumber } from 'ethers';
import { CardType } from './enum/card-type.enum';
import { formatEther } from 'nestjs-ethers';

@Resolver((of) => CardModel)
export class CardResolver {
  constructor(private readonly service: CardService) {}

  @Query((returns) => [CardModel])
  async allCards(): Promise<CardDocument[]> {
    return this.service.getAllCard();
  }

  @Query((returns) => String)
  async getPackFee(): Promise<string> {
    const fee = await this.service.getMintFee();

    return formatEther(fee);
  }

  @Mutation((returns) => CardTokenModel)
  @UseGuards(JwtAuthGuard)
  async buyToken(
    @CurrentUser() currentUser: User,
    @Args({ name: 'type', type: () => CardType }) type: CardType,
  ) {
    return this.service.mint(currentUser, type);
  }

  @Mutation((returns) => CardTokenModel)
  @UseGuards(JwtAuthGuard)
  async levelUpCard(
    @CurrentUser() currentUser: User,
    @Args('input') input: LevelUpCardInput,
  ) {
    const { sacrificeTokenIds } = input;

    return this.service.levelUpCard(
      currentUser,
      sacrificeTokenIds.map((id) => BigNumber.from(id)),
    );
  }

  @Query((returns) => [CardTokenModel])
  @UseGuards(JwtAuthGuard)
  async ownedCardTokens(@CurrentUser() currentUser: User) {
    return this.service.getCardTokensOfUser(currentUser);
  }

  @Query((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async canBuyToken(
    @CurrentUser() user: User,
    @Args({ name: 'type', type: () => CardType }) type: CardType,
  ) {
    return this.service.canMint(user, type);
  }
}
