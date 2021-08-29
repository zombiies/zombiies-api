import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '../user/schema/user.schema';
import { SignupInput } from './input/signup.input';
import { AuthService } from './auth.service';
import { AuthModel } from './model/auth.model';
import { LoginInput } from './input/login.input';

@Resolver((of) => User)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation((returns) => AuthModel)
  async signup(@Args('input') input: SignupInput): Promise<AuthModel> {
    return this.authService.signup(input);
  }

  @Mutation((returns) => AuthModel)
  async login(@Args('input') input: LoginInput): Promise<AuthModel> {
    return this.authService.login(input);
  }
}
