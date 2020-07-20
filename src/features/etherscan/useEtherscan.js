import { useWeb3React } from '@web3-react/core';

const baseUrlByChainId = {
  1: 'https://etherscan.io',
  42: 'https://kovan.etherscan.io',
};

function useEtherscanUrl() {
  const { chainId } = useWeb3React();
  return baseUrlByChainId[chainId] ?? baseUrlByChainId[1];
}

export function useEtherscanAddress(address) {
  const etherscanUrl = useEtherscanUrl();
  return `${etherscanUrl}/address/${address}`;
}

export function useEtherscanTransaction(txHash) {
  const etherscanUrl = useEtherscanUrl();
  return `${etherscanUrl}/tx/${txHash}`;
}
