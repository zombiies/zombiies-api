import { Field, ObjectType } from '@nestjs/graphql';
import { BoardCardModel } from './board-card.model';
import { DeckCardModel } from '../../deck/model/deck-card.model';

@ObjectType()
export class PlayerStatusModel {
  playerId: string;

  @Field((type) => [BoardCardModel])
  onBoard: BoardCardModel[];

  @Field((type) => [DeckCardModel])
  onHand: DeckCardModel[];

  crystal: number;
  inTurn: boolean;
  confirmTurn: boolean;
}
