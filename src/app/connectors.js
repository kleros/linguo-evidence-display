import { NetworkConnector } from '@web3-react/network-connector';

const env = process.env.NODE_ENV ?? 'development';

const defaultChainIdsPerEnv = {
  production: Number(process.env.DEFAULT_CHAIN_ID) ?? 100,
  development: Number(process.env.DEFAULT_CHAIN_ID) ?? 77,
};

const defaultChainId = defaultChainIdsPerEnv[env] ?? 100;

if (!process.env.JSON_RPC_URLS) {
  throw new Error('Missing JSON_RPC_URLS env var.');
}

const urls = JSON.parse(process.env.JSON_RPC_URLS);

export const network = new NetworkConnector({
  urls,
  defaultChainId,
  pollingInterval: 20000,
});

export const createNetworkConnector = ({ url, chainId, pollingInterval = 20000 }) => {
  return new NetworkConnector({
    urls: { [chainId]: url },
    defaultChainId: chainId,
    pollingInterval,
  });
};
