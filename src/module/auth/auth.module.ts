import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PasswordService } from './password.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from '../../config/security/jwt.config.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AuthResolver } from './auth.resolver';

@Module({
  providers: [AuthService, PasswordService, JwtStrategy, AuthResolver],
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
  ],
})
export class AuthModule {}
