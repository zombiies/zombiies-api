import { OmitType } from '@nestjs/graphql';
import { SignupInput } from '../../auth/input/signup.input';

export class CreateUserDto extends OmitType(SignupInput, [
  'password',
] as const) {
  passwordDigest: string;
}
