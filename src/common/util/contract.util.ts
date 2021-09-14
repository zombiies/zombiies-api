import { BigNumber, ContractReceipt, Event } from 'ethers';

type GetMiddleware = (from: string, to: string) => boolean;

export const getTokenIdsFromReceipt = (
  receipt: ContractReceipt,
  middleware?: GetMiddleware,
): BigNumber[] => {
  const events: Event[] = receipt.events || [];

  return events
    .filter((e) => e.event === 'Transfer')
    .map((e) => {
      const { args } = e;

      if (!args) {
        return undefined;
      }

      const { from, to, tokenId } = args;

      if (middleware && !middleware(from, to)) {
        return undefined;
      }

      return tokenId;
    })
    .filter((id) => typeof id !== 'undefined');
};
