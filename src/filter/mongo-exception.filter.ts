import { ArgumentsHost, Catch } from '@nestjs/common';
import { MongoError } from 'mongodb';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-express';
import { parseDuplicatedField } from '../common/util';

@Catch(MongoError)
export class MongoExceptionFilter implements GqlExceptionFilter {
  catch(exception: MongoError, _host: ArgumentsHost) {
    const { code, message } = exception;

    switch (code) {
      case 11000: // Duplicate
        const field = parseDuplicatedField(exception);
        const duplicateMessage = `${field} is duplicated`;
        return new UserInputError(duplicateMessage, {
          field: field,
          response: {
            message: [duplicateMessage],
            statusCode: 400,
          },
        });
    }

    return new UserInputError(message, {
      ...exception,
      response: {
        message: [message],
        statusCode: 400,
      },
    });
  }
}
