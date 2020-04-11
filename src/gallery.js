import React from 'react';
import PropTypes from 'prop-types';
import GalleryViewList from './components/gallery-view/gallery-view-list';
import AddGalleryItem from './components/add-gallery-item';

import './css/gallery.css';

const propTypes = {
  rows: PropTypes.array.isRequired,
  selectedGalleryView: PropTypes.object,
  table: PropTypes.object,
  imageColumns: PropTypes.array,
  getRow: PropTypes.func,
  selectedView: PropTypes.object,
  getRowDataByView: PropTypes.func,
  onInsertRow: PropTypes.func,
  isShowAllRowList: PropTypes.bool,
  onAddGalleryRowList: PropTypes.func,
  getRowCommentCount: PropTypes.func,
};

class Gallery extends React.Component {

  onScroll = () => {
    if (this.props.isShowAllRowList) {
      return;
    }
    if (this.galleryListRef.offsetHeight + this.galleryListRef.scrollTop + 1 > this.galleryBodyRef.offsetHeight) {
      this.props.onAddGalleryRowList();
    }
  }

  render() {
    const { imageColumns } = this.props;
    let imageColumn;
    if (imageColumns && imageColumns.length > 0) {
      imageColumn = imageColumns[0];
    }
    return (
        <div className="gallery-list-content" ref={ref => this.galleryListRef = ref} onScroll={this.onScroll}>
          <div ref={ref => this.galleryBodyRef = ref}>
            <GalleryViewList 
              rows={this.props.rows}
              imageColumn={imageColumn}
              getRow={this.props.getRow}
              table={this.props.table}
              getRowCommentCount={this.props.getRowCommentCount}
              selectedGalleryView={this.props.selectedGalleryView}
            />
            <AddGalleryItem 
              table={this.props.table}
              selectedView={this.props.selectedView}
              rows={this.props.rows}
              getRowDataByView={this.props.getRowDataByView}
              onInsertRow={this.props.onInsertRow}
            />
          </div>
        </div>
    );
  }
}

Gallery.propTypes = propTypes;

export default Gallery;