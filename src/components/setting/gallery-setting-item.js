import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Switch from './switch';
import { CELL_ICON } from '../../constants/cell-constants';

const propTypes = {
  column: PropTypes.object.isRequired,
  settings: PropTypes.array,
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
    let isShowColumnFormatter = settings.some(showColumnName => showColumnName === column.name);
    if (isShowColumnFormatter) this.setState({isChecked: true});
  }

  componentWillReceiveProps(nextProps) {
    const { settings, column } = this.props;
    let isShowColumnFormatter = settings.some(showColumnName => showColumnName === column.name);
    if (isShowColumnFormatter) {
      this.setState({isChecked: true});
    } else {
      this.setState({isChecked: false});
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