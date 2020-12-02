import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Switch from './switch';

const propTypes = {
  selectedTable: PropTypes.object,
  columnIconConfig: PropTypes.object,
  column: PropTypes.object.isRequired,
  settings: PropTypes.array,
  onColumnItemClick: PropTypes.func.isRequired,
  onMoveColumn: PropTypes.func
};
class GallerySettingItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isChecked: false,
      isItemDropTipShow: false
    };
    this.enteredCounter = 0;
  }

  componentDidMount() {
    const { settings, column } = this.props;
    let isShowColumnFormatter = settings.some(showColumnName => showColumnName === column.name);
    if (isShowColumnFormatter) this.setState({isChecked: true});
  }

  componentWillReceiveProps(nextProps) {
    const { settings, column } = nextProps;
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

  onDragStart = (event) => {
    event.stopPropagation();
    let ref = this.galleryItemRef;
    event.dataTransfer.setDragImage(ref, 10, 10);
    event.dataTransfer.effectAllowed = 'move';
    let dragStartItemData = JSON.stringify(this.props.column);
    event.dataTransfer.setData('text/plain', dragStartItemData);
  }

  onTableDragEnter = (event) => {
    event.stopPropagation();
    this.enteredCounter++;
    if (this.enteredCounter !== 0) {
      if (this.state.isItemDropTipShow) {
        return ;
      }
      this.setState({isItemDropTipShow: true});
    }
  }

  onDragOver = (event) => {
    if (event.dataTransfer.dropEffect === 'copy') {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  onDragLeave = (event) => {
    event.stopPropagation();
    this.enteredCounter--;
    if (this.enteredCounter === 0) {
      this.setState({isItemDropTipShow: false});
    }
  }

  onDrop = (event) => {
    event.stopPropagation();
    event.preventDefault();
    this.enteredCounter = 0;
    this.setState({isItemDropTipShow: false});
    let sourceColumn = event.dataTransfer.getData("text/plain");
    sourceColumn = JSON.parse(sourceColumn);
    const { onMoveColumn, column } = this.props;
    if (sourceColumn.name === column.name) {
      return;
    }
    onMoveColumn(sourceColumn.name, column.name);
  }

  render() {
    const { column, columnIconConfig } = this.props;
    let placeholder = <Fragment><i className={`dtable-font ${columnIconConfig[column.type]}`}></i><span>{column.name}</span></Fragment>;
    return (
      <div 
        className={`gallery-setting-item ${this.state.isItemDropTipShow ? 'column-can-drop' : ''}`} 
        ref={ref => this.galleryItemRef = ref}
        onDrop={this.onDrop}
        onDragEnter={this.onTableDragEnter}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
      >
        <div 
          className="drag-column-handle" 
          draggable="true"
          onDragStart={this.onDragStart}
        ><i className="dtable-font dtable-icon-drag"></i></div>
        <Switch 
          checked={this.state.isChecked}
          placeholder={placeholder}
          onChange={this.onColumnItemClick}
        />
      </div>
    );
  }
}

GallerySettingItem.propTypes = propTypes;

export default GallerySettingItem;