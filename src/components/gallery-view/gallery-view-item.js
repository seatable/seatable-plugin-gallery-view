/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
import ImageLazyLoad from './widgets/ImageLazyLoad';
import ImagePreviewerLightbox from './widgets/image-preview-lightbox';
import EditorFormatter from '../formatter/editor-formatter';
import { calculateColumns, calculateColumnsName } from '../../utils/utils';
import pluginContext from '../../plugin-context';
import { getImageThumbnailUrl } from '../../utils/utils';

const propTypes = {
  galleryItem: PropTypes.object,
  imageColumn: PropTypes.object,
  getRow: PropTypes.func,
  table: PropTypes.object,
  selectedGalleryView: PropTypes.object,
  columnIconConfig: PropTypes.object,
  width: PropTypes.number,
  itemMarginRightNone: PropTypes.bool,
  settings: PropTypes.object,
  currentColumns: PropTypes.array,
  selectedView: PropTypes.object,
  getLinkCellValue: PropTypes.func,
  getRowsByID: PropTypes.func,
  getTableById: PropTypes.func,
  collaborators: PropTypes.array,
  getUserCommonInfo: PropTypes.func,
  getMediaUrl: PropTypes.func,
  CellType: PropTypes.object,
  getOptionColors: PropTypes.func,
  formulaRows: PropTypes.object,
};

class GalleryViewItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowLargeImage: false,
      canOpenImage: false,
      largeImageIndex: '',
      images: [],
    };
  }

  onImageClick = (e, index) => {
    let { galleryItem } = this.props;
    let selectedImageColumn = this.getGalleryImageColumn();
    let imageColumnName = selectedImageColumn.name;
    this.setState({
      isShowLargeImage: true,
      images: galleryItem[imageColumnName],
      largeImageIndex: index,
    });
  };

  hideLargeImage = () => {
    this.setState({
      isShowLargeImage: false,
      largeImageIndex: '',
    });
  };

  moveNext = () => {
    let { galleryItem } = this.props;
    let selectedImageColumn = this.getGalleryImageColumn();
    let imageColumnName = selectedImageColumn.name;
    let images = galleryItem[imageColumnName];
    this.setState((prevState) => ({
      largeImageIndex: (prevState.largeImageIndex + 1) % images.length,
    }));
  };

  movePrev = () => {
    let { galleryItem } = this.props;
    let selectedImageColumn = this.getGalleryImageColumn();
    let imageColumnName = selectedImageColumn.name;
    let images = galleryItem[imageColumnName];
    this.setState((prevState) => ({
      largeImageIndex:
        (prevState.largeImageIndex + images.length - 1) % images.length,
    }));
  };

  onRowExpand = () => {
    let { table, galleryItem } = this.props;
    let row = this.props.getRow(table, galleryItem._id);
    pluginContext.expandRow(row, table);
  };

  getGalleryImageColumn = () => {
    const { settings, currentColumns } = this.props;
    const { shown_image_name } = settings;
    let imageColumn;
    if (!shown_image_name) {
      imageColumn = currentColumns.find((column) => column.type === 'image');
    } else {
      imageColumn = currentColumns.find(
        (column) => column.name === shown_image_name
      );
    }
    return imageColumn;
  };

  getGalleryTitleColumn = () => {
    const { settings, currentColumns } = this.props;
    const { shown_title_name } = settings;
    let titleColumn;
    if (!shown_title_name) {
      titleColumn = currentColumns.find((column) => column.key === '0000');
    } else {
      titleColumn = currentColumns.find(
        (column) => column.name === shown_title_name
      );
    }
    if (!titleColumn) {
      titleColumn =
        currentColumns.find((column) => column.key === '0000') || {};
    }
    return titleColumn;
  };

  getFilteredColumns = () => {
    const { settings, currentColumns } = this.props;
    const { shown_column_names, shown_title_name } = settings;

    let newColumnsName = calculateColumnsName(
      currentColumns,
      settings.column_name
    );
    let newColumns = calculateColumns(newColumnsName, currentColumns);
    let filteredColumns = [];
    if (shown_column_names) {
      filteredColumns = newColumns.filter((item) => {
        return shown_column_names.some((showColumnName) => {
          return (
            item.name === showColumnName && showColumnName !== shown_title_name
          );
        });
      });
    }
    return filteredColumns;
  };

  renderEditorFormatter = () => {
    let { galleryItem, table, settings } = this.props;
    let filteredColumns = this.getFilteredColumns();
    let row = this.props.getRow(table, galleryItem._id);
    return filteredColumns.map((column, index) => {
      return (
        <EditorFormatter
          index={index}
          column={column}
          selectedView={this.props.selectedView}
          row={row}
          table={table}
          getLinkCellValue={this.props.getLinkCellValue}
          getRowsByID={this.props.getRowsByID}
          getTableById={this.props.getTableById}
          collaborators={this.props.collaborators}
          getUserCommonInfo={this.props.getUserCommonInfo}
          getMediaUrl={this.props.getMediaUrl}
          CellType={this.props.CellType}
          formulaRows={this.props.formulaRows}
          getOptionColors={this.props.getOptionColors}
          displayColumnName={settings.display_field_name || false}
          columnIconConfig={this.props.columnIconConfig}
        />
      );
    });
  };

  renderRowTitle = () => {
    let titleColumn = this.getGalleryTitleColumn();
    const { galleryItem, table } = this.props;
    let row = this.props.getRow(table, galleryItem._id);
    return (
      <div className='row-title'>
        <EditorFormatter
          column={titleColumn}
          selectedView={this.props.selectedView}
          row={row}
          table={table}
          getLinkCellValue={this.props.getLinkCellValue}
          getRowsByID={this.props.getRowsByID}
          getTableById={this.props.getTableById}
          collaborators={this.props.collaborators}
          getUserCommonInfo={this.props.getUserCommonInfo}
          getMediaUrl={this.props.getMediaUrl}
          CellType={this.props.CellType}
          formulaRows={this.props.formulaRows}
          type='row_title'
          getOptionColors={this.props.getOptionColors}
        />
      </div>
    );
  };

  clickImage = (e) => {
    if (this.imageRef) {
      this.imageRef.onImageClick(e);
    }
  };

  render() {
    let { images, largeImageIndex } = this.state;
    let { galleryItem, itemMarginRightNone } = this.props;
    let selectedImageColumn = this.getGalleryImageColumn();
    let itemImage;

    let imageNumber = 0;
    if (selectedImageColumn) {
      let imageColumnName = selectedImageColumn.name;
      if (
        galleryItem[imageColumnName] &&
        galleryItem[imageColumnName].length > 0
      ) {
        imageNumber = galleryItem[imageColumnName].length;
        let imageURL = galleryItem[imageColumnName][0];
        if (imageURL.toLowerCase().indexOf('.svg') === -1) {
          // not svg
          imageURL = getImageThumbnailUrl(imageURL, 512);
        }
        itemImage = (
          <ImageLazyLoad
            ref={(ref) => (this.imageRef = ref)}
            imageUrl={imageURL}
            imageUrlsArr={this.props.galleryItem.Image}
            onImageClick={this.onImageClick}
          />
        );
      }
    }

    let style = { width: `${this.props.width}px` };
    if (itemMarginRightNone) {
      style = {
        width: `${this.props.width}px`,
        marginRight: 0,
      };
    }
    return (
      <div className='gallery-item' style={style}>
        {itemImage && (
          <div className='gallery-image-container' onClick={this.clickImage}>
            {itemImage}
          </div>
        )}
        <div
          className='text-truncate gallery-row-content'
          onClick={this.onRowExpand}
        >
          <div className='gallery-title-container'>{this.renderRowTitle()}</div>
          <div className='gallery-formatter-list'>
            {this.renderEditorFormatter()}
          </div>
        </div>
        {this.state.isShowLargeImage && (
          <ImagePreviewerLightbox
            imageItems={images}
            imageIndex={largeImageIndex}
            closeImagePopup={this.hideLargeImage}
            moveToPrevImage={this.movePrev}
            moveToNextImage={this.moveNext}
          />
        )}
      </div>
    );
  }
}

GalleryViewItem.propTypes = propTypes;

export default GalleryViewItem;
