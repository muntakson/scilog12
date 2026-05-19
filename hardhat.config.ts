import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  paths: { sources: './contracts', artifacts: './artifacts' },
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      accounts: process.env.NOTARY_PRIVATE_KEY ? [process.env.NOTARY_PRIVATE_KEY] : [],
    },
  },
};
export default config;
