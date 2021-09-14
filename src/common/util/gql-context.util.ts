export const getUserFromContext = <T extends { req: Record<string, any> }>(
  context: T,
) => {
  return context?.req?.user;
};
