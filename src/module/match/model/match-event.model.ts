import { Field, ObjectType } from '@nestjs/graphql';
import { GameEventType } from '../enum/game-event-type.enum';
import { PlayerTurn } from '../enum/player-turn.enum';
import { BoardPosition } from '../enum/board-position.enum';
import { CardSkillModel } from '../../card/model/card-skill.model';
import { MatchStatusModel } from './match-status.model';

@ObjectType()
export class MatchEventModel {
  @Field((type) => GameEventType)
  type: GameEventType;

  @Field((type) => PlayerTurn)
  playerTurn: PlayerTurn;

  tokenId?: string;
  crystalChanged?: number;

  @Field((type) => BoardPosition)
  toPosition?: BoardPosition;

  hpLost?: number;

  @Field((type) => CardSkillModel)
  skill?: CardSkillModel;

  @Field((type) => MatchStatusModel)
  currentMatchStatus: MatchStatusModel;
}
