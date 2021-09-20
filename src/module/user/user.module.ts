import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { UserResolver } from './user.resolver';
import { EtherClientModule } from '../ether-client/ether-client.module';
import { UserWalletResolver } from './user-wallet.resolver';
import { RoomModule } from '../room/room.module';

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
    RoomModule,
  ],
  exports: [UserService],
})
export class UserModule {}
