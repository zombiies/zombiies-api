import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BoardCardModel } from './board-card.model';
import { DeckCardModel } from '../../deck/model/deck-card.model';

@ObjectType()
export class PlayerStatusModel {
  playerId: string;

  onBoard: BoardCardModel[];

  onHand: DeckCardModel[];

  @Field((type) => Int)
  crystal: number;
  inTurn: boolean;
  confirmTurn: boolean;
}
