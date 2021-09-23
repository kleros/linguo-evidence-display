import React from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import t from 'prop-types';
import styled from 'styled-components';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { Spin } from 'antd';
import Web3 from 'web3';
import { createNetworkConnector } from './connectors';
import { withProvider } from './archon';
import LinguoEvidence from '../pages/LinguoEvidence';
import { createLinguoApi, LinguoApiProvider, useInjectedParams } from '~/features/linguo';

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <BrowserRouter>
        <Switch>
          <Route path="*">
            <Initializer>
              <LinguoEvidence />
            </Initializer>
          </Route>
        </Switch>
      </BrowserRouter>
    </Web3ReactProvider>
  );
}

export default hot(module)(App);

function Initializer({ children }) {
  const { activate, active, library } = useWeb3React();
  const { arbitrableJsonRpcUrl, arbitrableChainID } = useInjectedParams();

  const injectedNetworkConnector = React.useMemo(() => {
    if (arbitrableJsonRpcUrl && arbitrableChainID) {
      return createNetworkConnector({ url: arbitrableJsonRpcUrl, chainId: arbitrableChainID });
    }
  }, [arbitrableJsonRpcUrl, arbitrableChainID]);

  React.useEffect(() => {
    if (injectedNetworkConnector) {
      activate(injectedNetworkConnector);
    }
  }, [activate, injectedNetworkConnector]);

  const linguoApi = React.useMemo(
    () =>
      library
        ? createLinguoApi({
            web3: library,
            archon: withProvider(library.currentProvider),
          })
        : null,
    [library]
  );

  return (
    <StyledWrapper>
      <Spin
        spinning={!active}
        tip="Loading web3..."
        css={`
          position: fixed !important;
          left: 50% !important;
          top: 50% !important;
          transform: translate(-50%, -50%);
        `}
      >
        {linguoApi && <LinguoApiProvider api={linguoApi}>{children}</LinguoApiProvider>}
      </Spin>
    </StyledWrapper>
  );
}

Initializer.propTypes = {
  children: t.node,
};

Initializer.defaultProps = {
  children: null,
};

function getLibrary(provider) {
  return new Web3(provider);
}

const StyledWrapper = styled.div`
  min-height: 100vh;
`;
