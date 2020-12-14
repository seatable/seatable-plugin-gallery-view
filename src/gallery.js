import React from 'react';
import PropTypes from 'prop-types';
import GalleryViewList from './components/gallery-view/gallery-view-list';
import AddGalleryItem from './components/add-gallery-item';

import './css/gallery.css';

const propTypes = {
  tables: PropTypes.array,
  rows: PropTypes.array.isRequired,
  selectedGalleryView: PropTypes.object,
  table: PropTypes.object,
  imageColumns: PropTypes.array,
  getRow: PropTypes.func,
  selectedView: PropTypes.object,
  getInsertedRowInitData: PropTypes.func,
  onInsertRow: PropTypes.func,
  isShowAllRowList: PropTypes.bool,
  onAddGalleryRowList: PropTypes.func,
  onAddGalleryItem: PropTypes.func,
  settings: PropTypes.object,
  currentColumns: PropTypes.array,
  getLinkCellValue: PropTypes.func,
  getRowsByID: PropTypes.func,
  getTableById: PropTypes.func,
  collaborators: PropTypes.array,
  getUserCommonInfo: PropTypes.func,
  getMediaUrl: PropTypes.func,
  CellType: PropTypes.object,
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

    return (
      <div className="gallery-list-content" ref={ref => this.galleryListRef = ref} onScroll={this.onScroll}>
        <div ref={ref => this.galleryBodyRef = ref}>
          <GalleryViewList 
            rows={this.props.rows}
            getRow={this.props.getRow}
            table={this.props.table}
            selectedGalleryView={this.props.selectedGalleryView}
            settings={this.props.settings}
            currentColumns={this.props.currentColumns}
            selectedView={this.props.selectedView}
            getLinkCellValue={this.props.getLinkCellValue}
            getRowsByID={this.props.getRowsByID}
            getTableById={this.props.getTableById}
            collaborators={this.props.collaborators}
            getUserCommonInfo={this.props.getUserCommonInfo}
            getMediaUrl={this.props.getMediaUrl}
            CellType={this.props.CellType}
            selectedImageColumn={this.props.selectedImageColumn}
            tables={this.props.tables}
          />
          <AddGalleryItem 
            table={this.props.table}
            selectedView={this.props.selectedView}
            rows={this.props.rows}
            onAddGalleryItem={this.props.onAddGalleryItem}
          />
        </div>
      </div>
    );
  }
}

Gallery.propTypes = propTypes;

export default Gallery;