import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserDocument } from '../user/schema/user.schema';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from './type/jwt-payload.type';
import { SignupInput } from './input/signup.input';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginInput } from './input/login.input';
import { AuthModel } from './model/auth.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async validate(
    email: string,
    password: string,
  ): Promise<UserDocument | undefined> {
    const user = await this.userService.findOneByEmail(email);

    if (
      user &&
      (await this.passwordService.validatePassword(
        password,
        user.passwordDigest,
      ))
    ) {
      return user;
    }
  }

  async getUserFromPayload(payload: JwtPayloadType): Promise<UserDocument> {
    const { userId } = payload;

    return this.userService.findById(userId);
  }

  async generateToken(user: UserDocument): Promise<{ accessToken: string }> {
    const payload: JwtPayloadType = { userId: user.id };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signup(input: SignupInput): Promise<AuthModel> {
    const { password, ...rest } = input;
    const dto: CreateUserDto = {
      ...rest,
      passwordDigest: await this.passwordService.hashPassword(password),
    };

    const user = await this.userService.create(dto);
    const token = await this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthModel> {
    const { email, password } = input;

    const user = await this.validate(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    const token = await this.generateToken(user);

    return {
      user,
      token,
    };
  }
}
