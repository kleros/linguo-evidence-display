import Archon from '@kleros/archon';

const ipfsHostAddress = process.env.IPFS_HOST_ADDRESS || 'http://localhost:5001';

export function withProvider(provider) {
  return new Archon(provider, ipfsHostAddress);
}
