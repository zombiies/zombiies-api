import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserModel } from '../../user/model/user.model';
import { UserDocument } from '../../user/schema/user.schema';
import { BoardModel } from './board.model';
import { DeckCardModel } from '../../deck/model/deck-card.model';
import { PlayerTurn } from '../enum/player-turn.enum';

@ObjectType()
export class MatchModel {
  @Field((type) => ID)
  id: string;

  @Field((type) => UserModel)
  player1: UserDocument;

  @Field((type) => UserModel)
  player2: UserDocument;

  @Field((type) => BoardModel)
  player1Board: BoardModel;

  @Field((type) => BoardModel)
  player2Board: BoardModel;

  @Field((type) => [DeckCardModel])
  player1Cards: DeckCardModel[];

  @Field((type) => [DeckCardModel])
  player2Cards: DeckCardModel[];

  player1Crystal: number;
  playerCrystal: number;

  @Field((type) => PlayerTurn)
  currentTurn: PlayerTurn;
}
