const IPFS_GATEWAY_ADDRESS = process.env.IPFS_GATEWAY_ADDRESS ?? 'https://ipfs.kleros.io';

export function generateUrl(path) {
  // Removes any trailing slashes
  const normalizedHostAddress = IPFS_GATEWAY_ADDRESS.replace(/\/+$/, '');
  // Removes any slashes from the beginning as well as the /ipfs/ prefix
  const normalizedPath = path.replace(/^\/*(ipfs\/|ipfs)?/, '');

  return `${normalizedHostAddress}/ipfs/${normalizedPath}`;
}
