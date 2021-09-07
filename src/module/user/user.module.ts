import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { UserResolver } from './user.resolver';
import { EtherClientModule } from '../ether-client/ether-client.module';
import { UserWalletResolver } from './user-wallet.resolver';

@Module({
  providers: [UserService, UserResolver, UserWalletResolver],
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    EtherClientModule,
  ],
  exports: [UserService],
})
export class UserModule {}
