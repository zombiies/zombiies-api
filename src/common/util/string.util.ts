export const allStringsEqual = (...strings: string[]) =>
  new Set(strings).size === 1;
