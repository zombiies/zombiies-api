import { ArgumentsHost, Catch } from '@nestjs/common';
import { MongoError } from 'mongodb';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-express';
import { parseDuplicatedField } from '../util/mongo-error';

@Catch(MongoError)
export class MongoExceptionFilter implements GqlExceptionFilter {
  catch(exception: MongoError, _host: ArgumentsHost) {
    const { code, message } = exception;

    switch (code) {
      case 11000: // Duplicate
        const field = parseDuplicatedField(exception);
        return new UserInputError(`${field} is duplicated`, {
          field: field,
        });
    }

    return new UserInputError(message, {
      ...exception,
    });
  }
}
