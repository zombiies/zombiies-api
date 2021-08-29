import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { lowerCaseMiddleware } from '../../../middleware/field/lower-case.middleware';

@InputType()
export class LoginInput {
  @Field({ middleware: [lowerCaseMiddleware] })
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
