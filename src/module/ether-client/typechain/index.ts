import { SmartContract } from 'nestjs-ethers';
import { ZombiiesToken } from './ZombiiesToken';

export type Contract = SmartContract & ZombiiesToken;
