import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
  @Field((type) => ID)
  id: string;

  @Field((type) => String)
  username: string;

  @Field((type) => String)
  email: string;

  @Field((type) => Boolean)
  isVerified: boolean;
}
