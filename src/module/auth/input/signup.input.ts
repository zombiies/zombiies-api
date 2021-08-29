import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { lowerCaseMiddleware } from '../../../middleware/field/lower-case.middleware';

@InputType()
export class SignupInput {
  @Field()
  @IsNotEmpty()
  @MinLength(4)
  username: string;

  @Field({ middleware: [lowerCaseMiddleware] })
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
