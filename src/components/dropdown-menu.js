import React from 'react';
import PropTypes from 'prop-types';
import { zIndexes } from '../constants'

import '../css/dropdown-menu.css';

const propTypes = {
  dropdownMenuPosition: PropTypes.object,
  options: PropTypes.node,
};

class DropdownMenu extends React.Component {

  render() {
    let { dropdownMenuPosition, options } = this.props;
    let dropdownMenuStyle = {
      zIndex: zIndexes.DROPDOWN_MENU,
      ...dropdownMenuPosition,
    };
    return (
      <div className="dropdown-menu large show" style={dropdownMenuStyle}>
        {options || <div className="no-options">No options</div>}
      </div>
    );
  }
}

DropdownMenu.propTypes = propTypes;

export default DropdownMenu;