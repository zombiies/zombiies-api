import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, _host: ArgumentsHost): any {
    console.error(exception);
    const { response, message = 'Internal server error' } = exception;
    const extractedMessage = this.extractEthRevertReason(message);

    if (!response) {
      return new ApolloError(extractedMessage, 'INTERNAL_SERVER_ERROR', {
        response: {
          message: [extractedMessage],
          statusCode: 500,
        },
      });
    }

    return exception;
  }

  extractEthRevertReason(message: string): string {
    const messageToProcess = message.replace(/\\"/g, '"');

    const errorRegex = /message":"(.+?)"/;
    const revertRegex = /message":"Error:.+?'(.+?)'"/;

    const revertFound = messageToProcess.match(revertRegex);

    if (revertFound && revertFound.length == 2) {
      return revertFound[1];
    }

    const errorFound = messageToProcess.match(errorRegex);

    return errorFound?.length === 2 ? errorFound[1] : messageToProcess;
  }
}
