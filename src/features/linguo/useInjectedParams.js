import { useMemo } from 'react';
import { useLocation } from 'react-router';
import useQueryParams from '~/shared/useQueryParams';

export default function useInjectedParams() {
  const { search } = useLocation();
  const queryParams = useQueryParams();

  return useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(search).slice(1));
    } catch (err) {
      console.warn('Failed to parse URL params as JSON', err);
      return queryParams;
    }
  }, [search, queryParams]);
}
