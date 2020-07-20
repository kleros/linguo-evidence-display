import t from 'prop-types';
import Web3 from 'web3';

const { fromWei } = Web3.utils;

export default function FormattedCryptoCurrency({ value, decimals, symbol, render }) {
  value = fromWei(value);

  const numberFormatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });

  return render(numberFormatter.format(value), { value, decimals, symbol });
}

FormattedCryptoCurrency.propTypes = {
  value: t.oneOfType([t.string]).isRequired,
  decimals: t.number,
  symbol: t.string.isRequired,
  render: t.func,
};

FormattedCryptoCurrency.defaultProps = {
  decimals: 2,
  render: (formattedValue, { symbol }) => `${formattedValue} ${symbol}`,
};
