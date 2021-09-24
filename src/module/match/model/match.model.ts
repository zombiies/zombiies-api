import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PlayerStatusModel } from './player-status.model';
import { UserModel } from '../../user/model/user.model';
import { UserDocument } from '../../user/schema/user.schema';

@ObjectType()
export class MatchModel {
  @Field((type) => ID)
  id?: string;

  @Field((type) => [PlayerStatusModel])
  playerStatuses: PlayerStatusModel[];

  @Field((type) => UserModel)
  winner?: UserDocument;
}
