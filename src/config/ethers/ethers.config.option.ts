import { cleanEnv, str } from 'envalid';
import { registerAs } from '@nestjs/config';

type EthersConfigOption = {
  network: string;
  ownerPrivateKey: string;
  contractAddress: string;
  privateKeySecret: string;
  faucetPrivateKey: string;
};

export const getEthersOption = (): EthersConfigOption => {
  const env = cleanEnv(process.env, {
    ETHER_NETWORK: str(),
    OWNER_PRIVATE_KEY: str(),
    CONTRACT_ADDRESS: str(),
    PRIVATE_KEY_SECRET: str(),
    FAUCET_PRIVATE_KEY: str(),
  });

  const {
    CONTRACT_ADDRESS,
    ETHER_NETWORK,
    FAUCET_PRIVATE_KEY,
    OWNER_PRIVATE_KEY,
    PRIVATE_KEY_SECRET,
  } = env;

  return {
    network: ETHER_NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    ownerPrivateKey: OWNER_PRIVATE_KEY,
    privateKeySecret: PRIVATE_KEY_SECRET,
    faucetPrivateKey: FAUCET_PRIVATE_KEY,
  };
};

const ethersConfigOption = registerAs('ethers', () => getEthersOption());
export default ethersConfigOption;
