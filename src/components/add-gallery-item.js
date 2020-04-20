import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  rows: PropTypes.array.isRequired,
  table: PropTypes.object,
  selectedView: PropTypes.object,
  onAddGalleryItem: PropTypes.func,
};

class AddGalleryItem extends React.Component{

  addGalleryItem = () => {
    let { rows, selectedView, table } = this.props;
    let row_id = rows.length > 0 ? rows[rows.length - 1]._id : '';
    this.props.onAddGalleryItem(selectedView, table, row_id);
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