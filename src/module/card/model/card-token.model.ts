import { ObjectType, OmitType } from '@nestjs/graphql';
import { CardModel } from './card.model';

@ObjectType()
export class CardTokenModel extends OmitType(CardModel, ['id'] as const) {
  tokenId: string;
}
