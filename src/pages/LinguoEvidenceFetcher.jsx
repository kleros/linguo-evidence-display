import React from 'react';
import t from 'prop-types';
import { useLocation } from 'react-router';
import { withErrorBoundary, useErrorHandler } from 'react-error-boundary';
import { Alert } from 'antd';
import { useLinguoApi } from '~/features/linguo';

function LinguoEvidenceFetcher({ render }) {
  const { search } = useLocation();
  const { arbitrableContractAddress, disputeID } = React.useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(search).slice(1));
    } catch (err) {
      console.warn('Failed to parse URL params', err);
      throw err;
    }
  }, [search]);
  const linguoApi = useLinguoApi();

  const handleError = useErrorHandler();
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    async function getData() {
      setIsLoading(true);
      try {
        setData(await linguoApi.getMetaEvidence({ arbitrableContractAddress, disputeID }));
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    }

    getData();
  }, [linguoApi, arbitrableContractAddress, disputeID, handleError]);

  return render({ data, isLoading });
}

LinguoEvidenceFetcher.propTypes = {
  render: t.func.isRequired,
};

function ErrorFallback({ error, componentStack, resetErrorBoundary }) {
  return (
    <Alert
      type="error"
      message={<pre>{error.message}</pre>}
      description={
        <>
          <pre>{componentStack}</pre>
          <div
            css={`
              margin: 1rem 0;
            `}
          ></div>
          <button onClick={resetErrorBoundary}>Try again</button>
        </>
      }
    />
  );
}

ErrorFallback.propTypes = {
  error: t.instanceOf(Error).isRequired,
  componentStack: t.string.isRequired,
  resetErrorBoundary: t.func.isRequired,
};

export default withErrorBoundary(LinguoEvidenceFetcher, {
  FallbackComponent: ErrorFallback,
});
