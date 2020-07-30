import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import ImageLazyLoad from './widgets/ImageLazyLoad';
import ImagePreviewerLightbox from './widgets/image-preview-lightbox';
import EditorFormatter from '../formatter/editor-formatter';

const propTypes = {
  galleryItem: PropTypes.object,
  imageColumn: PropTypes.object,
  getRow: PropTypes.func,
  table: PropTypes.object,
  selectedGalleryView: PropTypes.object,
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
};

class GalleryViewItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowLargeImage: false,
      canOpenImage: false,
      largeImageIndex: '',
      images: []
    };
  }

  onImageClick = (e, index) => {
    let { galleryItem, imageColumn } = this.props;
    let imageColumnName = imageColumn.name;
    this.setState({
      isShowLargeImage: true,
      images: galleryItem[imageColumnName],
      largeImageIndex: index
    });
  }

  hideLargeImage = () => {
    this.setState({
      isShowLargeImage: false,
      largeImageIndex: ''
    });
  }

  moveNext = (e) => {
    let { galleryItem, imageColumn } = this.props;
    let imageColumnName = imageColumn.name;
    let images = galleryItem[imageColumnName];
    this.setState(prevState => ({
      largeImageIndex: (prevState.largeImageIndex + 1) % images.length,
    }));
  }
  
  movePrev = (e) => {
    e.preventDefault();
    let { galleryItem, imageColumn } = this.props;
    let imageColumnName = imageColumn.name;
    let images = galleryItem[imageColumnName];
    this.setState(prevState => ({
      largeImageIndex: (prevState.largeImageIndex + images.length - 1) % images.length,
    }));
  }
  
  onRowExpand = () => {
    let { table,  galleryItem } = this.props;
    let row = this.props.getRow(table, galleryItem._id);
    window.app.expandRow(row, table);
  }

  getFilteredColumns = () => {
    const { settings, currentColumns } = this.props;
    const { is_show_row_item } = settings;
    let filteredColumns = [];
    if (is_show_row_item) {
      filteredColumns = currentColumns.filter(item => {
        return is_show_row_item[item.name];
      })
    }
    return filteredColumns;
  }

  renderEditorFormatter = () => {
    let { galleryItem, table } = this.props;
    let filteredColumns = this.getFilteredColumns();
    let row = this.props.getRow(table, galleryItem._id);
    return filteredColumns.map((column, index) => {
      if (column.key === '0000') {
        let rowName = row['0000'] ? row['0000'] : intl.get('Unnamed_record');
        return <div key={`row-title-${index}`} className="row-title" onClick={this.onRowExpand}>{rowName}</div>
      } else {
        return (<EditorFormatter
          key={`editor-formatter-${index}`}
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
        />);
      }
    })
  }

  render() {
    let { images, largeImageIndex } = this.state;
    let { galleryItem, imageColumn, itemMarginRightNone} = this.props;
    let itemImage;
    let imageNumber = 0;
    if (imageColumn) {
      let imageColumnName = imageColumn.name;
      if (galleryItem[imageColumnName] && galleryItem[imageColumnName].length > 0) {
        imageNumber = galleryItem[imageColumnName].length;
        itemImage = <ImageLazyLoad imageUrl={galleryItem[imageColumnName][0]} onImageClick={this.onImageClick} />
      }
    }

    let style = { width: `${this.props.width}px`};
    if (itemMarginRightNone) {
      style = {
        width: `${this.props.width}px`,
        marginRight: 0
      }
    }
    return (
      <div className="gallery-item"  style={style}>
        {imageNumber > 1 && 
          <div className="gallery-image-number">
            {imageNumber}
          </div>
        }
        <div className="gallery-image-container">
          {itemImage}
        </div>
        <div className="text-truncate gallery-row-content">
          {this.renderEditorFormatter()}
        </div>
        {this.state.isShowLargeImage && 
          <ImagePreviewerLightbox 
            imageItems={images}
            imageIndex={largeImageIndex}
            closeImagePopup={this.hideLargeImage}
            moveToPrevImage={this.movePrev}
            moveToNextImage={this.moveNext}
          /> 
        }
      </div>
    );
  }
}

GalleryViewItem.propTypes = propTypes;

export default GalleryViewItem;