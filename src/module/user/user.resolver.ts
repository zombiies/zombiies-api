import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserModel } from './model/user.model';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UserDocument } from './schema/user.schema';
import { UserService } from './user.service';

@Resolver((of) => UserModel)
export class UserResolver {
  constructor(private readonly service: UserService) {}

  @Query((returns) => UserModel)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() currentUser: UserDocument): UserDocument {
    return currentUser;
  }

  @ResolveField()
  async wallet(@Parent() user: UserDocument) {
    return this.service.getWalletInfoOf(user);
  }
}
