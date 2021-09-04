import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CardDocument } from './schema/card.schema';
import { Model } from 'mongoose';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
  ) {}

  private allCards: CardDocument[];

  async getAllCard(): Promise<CardDocument[]> {
    if (typeof this.allCards === 'undefined') {
      this.allCards = await this.cardModel.find();
    }

    return this.allCards;
  }

  async createCard(params: Card) {
    const card = new this.cardModel(params);
    await card.save();

    return card;
  }

  async deleteAll() {
    await this.cardModel.deleteMany();
  }
}
