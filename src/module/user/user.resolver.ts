import { Query, Resolver } from '@nestjs/graphql';
import { UserModel } from './model/user.model';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UserDocument } from './schema/user.schema';

@Resolver((of) => UserModel)
export class UserResolver {
  @Query((returns) => UserModel)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() currentUser: UserDocument): UserDocument {
    return currentUser;
  }
}
