import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenModel {
  accessToken: string;
}
