import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useErrorHandler, withErrorBoundary } from 'react-error-boundary';
import { Alert } from 'antd';
import { useInjectedParams, useLinguoApi } from '~/features/linguo';

function LinguoEvidenceFetcher({ render }) {
  const { arbitrableContractAddress, disputeID } = useInjectedParams();
  const linguoApi = useLinguoApi();

  const handleError = useErrorHandler();
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    async function getData() {
      setIsLoading(true);
      try {
        const metaEvidence = await linguoApi.getMetaEvidence({ arbitrableContractAddress, disputeID });
        setData(metaEvidence);
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
    <div
      css={`
        padding: 1rem;
      `}
    >
      <Alert
        type="error"
        message={<pre>Error: {error.message}</pre>}
        css={`
          width: calc(100vw - 2rem);
        `}
        description={
          <>
            {process.env.NODE_ENV !== 'production' && (
              <div>
                <StyledPre>{componentStack}</StyledPre>
                <div
                  css={`
                    margin-bottom: 2rem;
                  `}
                ></div>
              </div>
            )}
            <button onClick={resetErrorBoundary}>Try again</button>
          </>
        }
      />
    </div>
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

const StyledPre = styled.pre`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;
