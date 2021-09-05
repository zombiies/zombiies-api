import { Network, RINKEBY_NETWORK } from 'nestjs-ethers';
import { cleanEnv, str } from 'envalid';
import { MAINNET_NETWORK } from 'nestjs-ethers/dist/ethers.constants';
import { registerAs } from '@nestjs/config';

type EthersConfigOption = {
  network: Network;
  alchemyApiKey: string;
  ownerPrivateKey: string;
  contractAddress: string;
  privateKeySecret: string;
};

export const EthersNetwork = {
  MAINNET_NETWORK: MAINNET_NETWORK,
  RINKEBY_NETWORK: RINKEBY_NETWORK,
};

export const getEthersOption = (): EthersConfigOption => {
  const env = cleanEnv(process.env, {
    ETHER_NETWORK: str({ choices: Object.keys(EthersNetwork) }),
    ALCHEMY_API_KEY: str(),
    OWNER_PRIVATE_KEY: str(),
    CONTRACT_ADDRESS: str(),
    PRIVATE_KEY_SECRET: str(),
  });

  const {
    CONTRACT_ADDRESS,
    ETHER_NETWORK,
    ALCHEMY_API_KEY,
    OWNER_PRIVATE_KEY,
    PRIVATE_KEY_SECRET,
  } = env;

  return {
    network: EthersNetwork[ETHER_NETWORK],
    contractAddress: CONTRACT_ADDRESS,
    alchemyApiKey: ALCHEMY_API_KEY,
    ownerPrivateKey: OWNER_PRIVATE_KEY,
    privateKeySecret: PRIVATE_KEY_SECRET,
  };
};

const ethersConfigOption = registerAs('ethers', () => getEthersOption());
export default ethersConfigOption;
