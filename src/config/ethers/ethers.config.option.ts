import { cleanEnv, str } from 'envalid';
import { registerAs } from '@nestjs/config';

type EthersConfigOption = {
  ownerPrivateKey: string;
  contractAddress: string;
  privateKeySecret: string;
  network: string;
};

export const getEthersOption = (): EthersConfigOption => {
  const env = cleanEnv(process.env, {
    OWNER_PRIVATE_KEY: str(),
    CONTRACT_ADDRESS: str(),
    PRIVATE_KEY_SECRET: str(),
    ETH_NETWORK: str(),
  });

  const {
    CONTRACT_ADDRESS,
    OWNER_PRIVATE_KEY,
    PRIVATE_KEY_SECRET,
    ETH_NETWORK,
  } = env;

  return {
    contractAddress: CONTRACT_ADDRESS,
    ownerPrivateKey: OWNER_PRIVATE_KEY,
    privateKeySecret: PRIVATE_KEY_SECRET,
    network: ETH_NETWORK,
  };
};

const ethersConfigOption = registerAs('ethers', () => getEthersOption());
export default ethersConfigOption;
