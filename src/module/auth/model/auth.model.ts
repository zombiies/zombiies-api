import { Field, ObjectType } from '@nestjs/graphql';
import { UserModel } from '../../user/model/user.model';
import { UserDocument } from '../../user/schema/user.schema';
import { TokenModel } from './token.model';

@ObjectType()
export class AuthModel {
  @Field((type) => UserModel)
  user: UserDocument;

  @Field((type) => TokenModel)
  token: TokenModel;
}
