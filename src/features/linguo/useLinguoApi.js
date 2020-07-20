import { useContext } from 'react';
import LinguoApiContext from './LinguoApiContext';

export default function useLinguoApi() {
  const api = useContext(LinguoApiContext);

  return api;
}
