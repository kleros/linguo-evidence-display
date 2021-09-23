import { NetworkConnector } from '@web3-react/network-connector';

export const createNetworkConnector = ({ url, chainId, pollingInterval = 20000 }) => {
  return new NetworkConnector({
    urls: { [chainId]: url },
    defaultChainId: chainId,
    pollingInterval,
  });
};
