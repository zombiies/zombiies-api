import {
  PINATA_MODULE_CONNECTION,
  PINATA_MODULE_CONNECTION_TOKEN,
  PINATA_MODULE_OPTIONS_TOKEN,
} from './pinata.constant';
import { PinataModuleOptions } from './pinata.interface';
import { PinataClient } from '@pinata/sdk';
import * as pinataSdk from '@pinata/sdk';

const createPinataClient = (
  pinataApiKey: string,
  pinataSecretApiKey: string,
): PinataClient => {
  return (pinataSdk as any)(pinataApiKey, pinataSecretApiKey);
};

export const getPinataOptionsToken = (connection: string): string =>
  `${connection || PINATA_MODULE_CONNECTION}_${PINATA_MODULE_OPTIONS_TOKEN}`;

export const getPinataConnectionToken = (connection: string): string =>
  `${connection || PINATA_MODULE_CONNECTION}_${PINATA_MODULE_CONNECTION_TOKEN}`;

export const createPinataConnection = (
  options: PinataModuleOptions,
): PinataClient => {
  const { apiKey, secret } = options;

  return createPinataClient(apiKey, secret);
};
