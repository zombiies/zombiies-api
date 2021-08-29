import { MongoError } from 'mongodb';

export const parseDuplicatedField = (exception: MongoError) => {
  const { message } = exception;

  const tokens = message.split('dup key: {');

  if (tokens.length < 2) {
    return undefined;
  }

  const fieldTokens = tokens[1].split(':');

  return fieldTokens[0].trim();
};
