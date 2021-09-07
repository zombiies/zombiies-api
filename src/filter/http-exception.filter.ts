import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, _host: ArgumentsHost): any {
    const { message } = exception;
    const exceptionResponse: any = exception.getResponse();

    return new ApolloError(message, 'INTERNAL_SERVER_ERROR', {
      response: this.getExtensionResponse(
        exceptionResponse,
        exception.getStatus(),
      ),
    });
  }

  getExtensionResponse(exceptionResponse: any, statusCode: number) {
    if (typeof exceptionResponse === 'string') {
      return {
        message: [exceptionResponse],
        statusCode,
        error: exceptionResponse,
      };
    }

    const { message, error } = exceptionResponse;

    return {
      message: typeof message === 'string' ? [message] : message,
      statusCode,
      error,
    };
  }
}
