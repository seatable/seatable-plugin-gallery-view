import React from 'react';
import PropTypes from 'prop-types';

import addRowIcon from '../assets/image/add.png';

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
        <img src={addRowIcon} alt="" width="54" />
      </div>
    );
  }
}

AddGalleryItem.propTypes = propTypes;

export default AddGalleryItem;
