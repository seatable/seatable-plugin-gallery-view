import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  rows: PropTypes.array.isRequired,
  table: PropTypes.object,
  selectedView: PropTypes.object,
  getRowDataByView: PropTypes.func,
  onInsertRow: PropTypes.func,
};

class AddGalleryItem extends React.Component{

  addGalleryItem = () => {
    let { rows, getRowDataByView, selectedView, table } = this.props;
    let row_id = rows.length > 0 ? rows[rows.length - 1]._id : '';
    let rowData = getRowDataByView(selectedView, table, row_id);
    this.props.onInsertRow(table, selectedView, rowData);
  }

  render() {
    return(
      <div className="add-gallery-item" onClick={this.addGalleryItem}>
        <span className="dtable-font dtable-icon-add add-gallery-row"></span>
      </div>
    );
  }
}

AddGalleryItem.propTypes = propTypes;

export default AddGalleryItem;