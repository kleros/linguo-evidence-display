import { NetworkConnector } from '@web3-react/network-connector';

const env = process.env.NODE_ENV ?? 'development';

const defaultChainIdsPerEnv = {
  production: Number(process.env.DEFAULT_CHAIN_ID) ?? 1,
  development: Number(process.env.DEFAULT_CHAIN_ID) ?? 42,
};

const defaultChainId = defaultChainIdsPerEnv[env] ?? 42;

export const network = new NetworkConnector({
  urls: {
    1: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    42: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
  },
  pollingInterval: 20000,
  defaultChainId,
});
