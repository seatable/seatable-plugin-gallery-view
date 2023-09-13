import React from 'react';
import PropTypes from 'prop-types';
import GalleryViewList from './gallery-view/gallery-view-list';
import AddGalleryItem from './add-gallery-item';
import { canCreateRows } from '../utils/utils';

import '../assets/css/gallery.css';

const propTypes = {
  rows: PropTypes.array.isRequired,
  selectedGalleryView: PropTypes.object,
  table: PropTypes.object,
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
  getOptionColors: PropTypes.func,
  getTablePermissionType: PropTypes.func,
  formulaRows: PropTypes.object,
  selectedImageColumn: PropTypes.func,
  getColumnIconConfig: PropTypes.func,
  isFitMode: PropTypes.bool,
};

class Gallery extends React.Component {

  constructor(props) {
    super(props);
    const TABLE_PERMISSION_TYPE = props.getTablePermissionType();
    this.columnIconConfig = props.getColumnIconConfig();
    this._canCreateRows = canCreateRows(props.table, TABLE_PERMISSION_TYPE);
  }

  setInnerRef = (innerDom) => {
    this.galleryViewListRef = innerDom.galleryListRef;
  }

  onScroll = () => {
    if (this.props.isShowAllRowList) {
      return;
    }
    const { offsetHeight, scrollTop } = this.galleryListContentRef;
    if (offsetHeight + scrollTop + 1 > this.galleryViewListRef.offsetHeight) {
      this.props.onAddGalleryRowList();
    }
  }

  render() {
    return (
      <div className="gallery-list-content" ref={ref => this.galleryListContentRef = ref} onScroll={this.onScroll}>
        <div className="flex-fill">
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
            formulaRows={this.props.formulaRows}
            getOptionColors={this.props.getOptionColors}
            columnIconConfig={this.columnIconConfig}
            onRef={this.setInnerRef}
            isFitMode={this.props.isFitMode}
          />
          {this._canCreateRows &&
            <AddGalleryItem
              table={this.props.table}
              selectedView={this.props.selectedView}
              rows={this.props.rows}
              onAddGalleryItem={this.props.onAddGalleryItem}
            />
          }
        </div>
      </div>
    );
  }
}

Gallery.propTypes = propTypes;

export default Gallery;
