export const lowerMapKey = <T extends Record<string, any>>(map: T) =>
  Object.fromEntries(
    Object.entries(map).map(([k, v]) => [k.toLocaleLowerCase(), v]),
  );
