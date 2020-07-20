import t from 'prop-types';

export default function FormattedDate({ value, render }) {
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });

  value = new Date(value);
  return render(dateFormatter.format(value));
}

FormattedDate.propTypes = {
  value: t.oneOfType([t.string, t.instanceOf(Date)]).isRequired,
  render: t.func,
};

FormattedDate.defaultProps = {
  render: value => value,
};
