import { FieldMiddleware } from '@nestjs/graphql';

export const lowerCaseMiddleware: FieldMiddleware = async (ctx, next) => {
  const value = await next();

  return value?.toLowerCase();
};
