import React from 'react';
import PropTypes from 'prop-types';
import GalleryViewItem from './gallery-view-item';

const propTypes = {
  rows: PropTypes.array.isRequired,
  imageColumn: PropTypes.object,
  getRow: PropTypes.func,
  table: PropTypes.object,
  getRowCommentCount: PropTypes.func,
  selectedGalleryView: PropTypes.object,
};

class GalleryViewList extends React.Component {

  render() {
    const { rows, imageColumn } = this.props;
    return (
      <div className="gallery-list">
        {rows && rows.map((galleryItem, index) => {
          return (
            <GalleryViewItem 
              key={`galleryItem${index}`}
              galleryItem={galleryItem}
              imageColumn={imageColumn}
              getRow={this.props.getRow}
              table={this.props.table}
              getRowCommentCount={this.props.getRowCommentCount}
              selectedGalleryView={this.props.selectedGalleryView}
            />
          );
        })}
      </div>
    );
  }
}

GalleryViewList.propTypes = propTypes;

export default GalleryViewList;