import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RoomModel {
  @Field((type) => ID)
  id: string;

  player1: string;
  player2?: string;
}
