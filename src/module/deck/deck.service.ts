import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Deck, DeckCard, DeckDocument } from './schema/deck.schema';
import { Model } from 'mongoose';
import { CardService } from '../card/card.service';
import { UserDocument } from '../user/schema/user.schema';
import { BigNumber } from 'ethers';
import { DeckCardModel } from './model/deck-card.model';
import { CardType } from '../card/enum/card-type.enum';

@Injectable()
export class DeckService {
  constructor(
    @InjectModel(Deck.name) private readonly model: Model<DeckDocument>,
    private readonly cardService: CardService,
  ) {}

  async removeCardFromDeck(
    user: UserDocument,
    tokenId: BigNumber,
    deckId: string,
  ) {
    const deck = await this.getDeckWithUserPermission(user, deckId);
    const { deckCards } = deck;
    await this.model
      .updateOne(
        {
          _id: deck._id,
        },
        {
          $set: {
            deckCards: deckCards.filter(
              ({ tokenId: deckTokenId }) =>
                deckTokenId !== tokenId.toHexString(),
            ),
          },
        },
      )
      .exec();

    return this.model.findById(deck._id).exec();
  }

  async addCardToDeck(user: UserDocument, tokenId: BigNumber, deckId: string) {
    const deck = await this.getDeckWithUserPermission(user, deckId);
    const token = await this.cardService.findAndCheckTokenByUser(user, tokenId);
    const { deckCards } = deck;

    const isAdded = deckCards.find((d) => d.tokenId === tokenId.toHexString());

    if (isAdded) {
      throw new BadRequestException(
        'This card have already added to this deck',
      );
    }

    const existedPosition = deckCards
      .map((c) => c.position)
      .filter((position) =>
        token.type === CardType.MONSTER ? position < 8 : position >= 8,
      );

    if (existedPosition.length === 8) {
      throw new BadRequestException('Your deck is full');
    }

    const newPosition = Array.from(
      { length: 8 },
      (_u, v) => v + (token.type === CardType.MONSTER ? 0 : 8),
    ).find((p) => !existedPosition.includes(p));

    await this.model
      .updateOne(
        {
          _id: deck._id,
        },
        {
          $set: {
            deckCards: [
              ...deckCards,
              {
                position: newPosition,
                tokenId: tokenId.toHexString(),
              },
            ].sort((c1, c2) => c1.position - c2.position),
          },
        },
      )
      .exec();

    return this.model.findById(deck._id).exec();
  }

  async updateDeck(user: UserDocument, deckId: string, name: string) {
    const deck = await this.getDeckWithUserPermission(user, deckId);

    await this.model
      .updateOne(
        {
          _id: deck._id,
        },
        {
          $set: {
            name,
          },
        },
      )
      .exec();

    return this.model.findById(deck._id).exec();
  }

  async createDeck(user: UserDocument, name: string) {
    if ((await this.ownedDecksCount(user)) >= 3) {
      throw new BadRequestException(
        'Each player can have only maximum of 3 decks',
      );
    }

    const deck = new this.model({
      name,
      owner: user._id,
    });
    await deck.save();

    return deck;
  }

  async deleteDeck(user: UserDocument, deckId: string) {
    const deck = await this.getDeckWithUserPermission(user, deckId);

    return this.model
      .deleteOne({
        _id: deck._id,
      })
      .exec();
  }

  async getDeckWithUserPermission(user: UserDocument, deckId) {
    const deck = await this.model.findById(deckId).exec();

    if (!deck) {
      throw new NotFoundException('Not found this deck id');
    }

    if (deck.owner?._id?.toString() !== user._id.toString()) {
      console.log(deck.owner?._id);
      console.log(user._id);
      throw new ForbiddenException(
        'You do not have permission to do this action',
      );
    }

    return deck;
  }

  async ownedDecks(user: UserDocument) {
    return this.model
      .find({
        owner: user._id,
      })
      .exec();
  }

  async ownedDecksCount(user: UserDocument) {
    return this.model
      .countDocuments({
        owner: user._id,
      })
      .exec();
  }

  async getDeckCardModels(deckCards: DeckCard[]): Promise<DeckCardModel[]> {
    const tokenIds = deckCards.map((c) => BigNumber.from(c.tokenId));
    const tokens = await this.cardService.findCardTokens(tokenIds);

    return deckCards.map((deckCard) => {
      const { tokenId, position } = deckCard;
      const token = tokens.find((t) => t.tokenId === tokenId);

      return {
        position,
        ...token,
      };
    });
  }

  async isCardInDeck(user: UserDocument, tokenId: BigNumber, deckId: string) {
    const deck = await this.getDeckWithUserPermission(user, deckId);

    const { deckCards } = deck;

    return deckCards.some((c) => c.tokenId === tokenId.toHexString());
  }
}
