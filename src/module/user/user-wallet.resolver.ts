import { Query, Resolver } from '@nestjs/graphql';
import { User } from './schema/user.schema';
import { UserWalletModel } from './model/user-wallet.model';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';

@Resolver((of) => UserWalletModel)
export class UserWalletResolver {
  constructor(private readonly service: UserService) {}

  @Query((returns) => UserWalletModel)
  @UseGuards(JwtAuthGuard)
  async ownedWallet(@CurrentUser() currentUser: User) {
    return this.service.getWalletInfoOf(currentUser);
  }
}
