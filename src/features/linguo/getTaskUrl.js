const LINGUO_HOST_ADDRESS = process.env.LINGUO_HOST_ADDRESS ?? 'https://linguo.kleros.io';

export default function getTaskUrl({ contractAddress, taskID }) {
  const host = LINGUO_HOST_ADDRESS.replace(/\/+$/, '');
  return `${host}/translation/${contractAddress}/${taskID}`;
}
