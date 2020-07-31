import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Switch from './switch';
import { CELL_ICON } from '../../constants/cell-contants';

const propTypes = {
  column: PropTypes.object.isRequired,
  settings: PropTypes.object,
  onColumnItemClick: PropTypes.func.isRequired
};

class GallerySettingItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isChecked: false
    };
  }

  componentDidMount() {
    const { settings, column } = this.props;
    const { is_show_row_item } = settings;
    if (is_show_row_item) {
      let isColumnCheckedIndex = Object.keys(is_show_row_item).findIndex(item => item === column.name);
      if (isColumnCheckedIndex > -1) {
        this.setState({isChecked: is_show_row_item[column.name]})
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { settings, column } = this.props;
    const { is_show_row_item } = settings;
    if (!is_show_row_item) {
      this.setState({isChecked: false});
    } else {
      let isColumnCheckedIndex = Object.keys(is_show_row_item).findIndex(item => item === column.name);
      if (isColumnCheckedIndex > -1) {
        this.setState({isChecked: is_show_row_item[column.name]});
      }
    }
  }

  onColumnItemClick = (event) => {
    event.nativeEvent.stopImmediatePropagation();
    let value = event.target.checked;
    if (value === this.state.isChecked) {
      return;
    }
    let { column } = this.props;
    this.setState({isChecked: value}, () => {
      this.props.onColumnItemClick(column, value); 
    });
  }

  render() {
   let { column } = this.props;
    let placeholder = <Fragment><i className={`dtable-font ${CELL_ICON[column.type]}`}></i><span>{column.name}</span></Fragment>;
    return(
      <Switch 
        checked={this.state.isChecked}
        placeholder={placeholder}
        onChange={this.onColumnItemClick}
      />
    );
  }
}

GallerySettingItem.propTypes = propTypes;

export default GallerySettingItem;