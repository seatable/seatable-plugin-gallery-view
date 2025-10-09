import SvgIcon from './svg-icon';
import React from 'react';
import PropTypes from 'prop-types';

const Icon = (props) => {
  const { className, title, symbol, color } = props;

  if (symbol.startsWith('dtable-icon')) {
    return (
      <span
        className={`dtable-font ${symbol} ${className || ''}`}
        style={{ color }}
      />
    );
  }

  return (
    <SvgIcon
      symbol={symbol}
      color={color}
      className={className}
      title={title}
    />
  );
};

Icon.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  symbol: PropTypes.string.isRequired,
  color: PropTypes.string,
};

export default Icon;
