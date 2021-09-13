import { registerAs } from '@nestjs/config';
import { getEnvConfig } from '../env.config';

type EthersConfigOption = {
  ownerPrivateKey: string;
  contractAddress: string;
  privateKeySecret: string;
  network: string;
};

export const getEthersOption = (): EthersConfigOption => {
  const {
    CONTRACT_ADDRESS,
    OWNER_PRIVATE_KEY,
    PRIVATE_KEY_SECRET,
    ETH_NETWORK,
  } = getEnvConfig();

  return {
    contractAddress: CONTRACT_ADDRESS,
    ownerPrivateKey: OWNER_PRIVATE_KEY,
    privateKeySecret: PRIVATE_KEY_SECRET,
    network: ETH_NETWORK,
  };
};

const ethersConfigOption = registerAs('ethers', () => getEthersOption());
export default ethersConfigOption;
