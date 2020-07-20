import React from 'react';
import t from 'prop-types';

const LinguoApiContext = React.createContext({
  async getMetaEvidence() {
    throw new Error('Linguo API not initialized!');
  },
});

export default LinguoApiContext;

export function LinguoApiProvider({ api, children }) {
  return <LinguoApiContext.Provider value={api}>{children}</LinguoApiContext.Provider>;
}

LinguoApiProvider.propTypes = {
  api: t.object.isRequired,
  children: t.node,
};

LinguoApiProvider.defaultProps = {
  children: null,
};
