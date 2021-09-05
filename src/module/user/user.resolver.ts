import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserModel } from './model/user.model';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UserDocument } from './schema/user.schema';
import { EtherClientService } from '../ether-client/ether-client.service';
import { formatEther } from 'nestjs-ethers';

@Resolver((of) => UserModel)
export class UserResolver {
  constructor(private readonly etherClientService: EtherClientService) {}

  @Query((returns) => UserModel)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() currentUser: UserDocument): UserDocument {
    return currentUser;
  }

  @ResolveField()
  walletAddress(@Parent() user: UserDocument) {
    return this.etherClientService.createWalletFromPrivateKeyCipher(
      user.privateKeyCipher,
    ).address;
  }

  @ResolveField()
  async walletBalance(@Parent() user: UserDocument) {
    const balance = await this.etherClientService
      .createWalletFromPrivateKeyCipher(user.privateKeyCipher)
      .getBalance();

    return formatEther(balance);
  }
}
