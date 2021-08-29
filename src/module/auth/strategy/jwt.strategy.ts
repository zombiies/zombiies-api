import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import securityConfigOption from '../../../config/security/security.config.option';
import { ConfigType } from '@nestjs/config';
import { JwtPayloadType } from '../type/jwt-payload.type';
import { AuthService } from '../auth.service';
import { UserDocument } from '../../user/schema/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(securityConfigOption.KEY)
    private readonly securityConfig: ConfigType<typeof securityConfigOption>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: securityConfig.jwt.secret,
    });
  }

  async validate(payload: JwtPayloadType): Promise<UserDocument> {
    return this.authService.getUserFromPayload(payload);
  }
}
