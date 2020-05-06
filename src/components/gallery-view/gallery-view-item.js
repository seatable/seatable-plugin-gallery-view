import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import ImageLazyLoad from './widgets/ImageLazyLoad';
import ImagePreviewerLightbox from './widgets/image-preview-lightbox';
import { SingleSelectFormatter } from 'dtable-ui-component';
const propTypes = {
  galleryItem: PropTypes.object,
  imageColumn: PropTypes.object,
  getRow: PropTypes.func,
  table: PropTypes.object,
  getRowCommentCount: PropTypes.func,
  selectedGalleryView: PropTypes.object,
  width: PropTypes.number,
  itemMarginRightNone: PropTypes.bool
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

  renderOptionList = () => {
    const { galleryItem, table, singleSelectColumns } = this.props;
    let row = this.props.getRow(table, galleryItem._id);
    let optionsList = [];
    let optionDataList = [];
    let optionFormatterList = [];
    if (Array.isArray(singleSelectColumns) && singleSelectColumns.length > 0) {
      singleSelectColumns.forEach(item => {
        optionsList.push(...item.data.options);
        optionDataList.push(row[item.key]);
      })

      optionDataList.forEach(optionID => {
        let formatter;
        if (optionID) {
          formatter = optionsList.find(option => optionID === option.id);
          if (formatter) {
            optionFormatterList.push(optionID);
          } else {
            optionFormatterList.push(false);
          }
          return;
        }
        optionFormatterList.push(false);
      });
      return (
        <div className="formatter-container">
          {optionFormatterList.map((item, index) => {
            if (item) return <SingleSelectFormatter key={`singleselect${index}`} options={optionsList} value={item} />;
            return null;
          })}
          {optionFormatterList.every(item => !item) && <span className="row-cell-empty d-inline-block"></span>}
        </div>
      )
    }
    return <span className="row-cell-empty d-inline-block"></span>;
  }

  render() {
    let { images, largeImageIndex } = this.state;
    let { galleryItem, imageColumn, itemMarginRightNone } = this.props;
    let rowName = galleryItem['Name'] ? galleryItem['Name'] : intl.get('Unnamed_record');
    let optionList = this.renderOptionList();
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
          <div className="row-title" onClick={this.onRowExpand}>{rowName}</div>
          {optionList}
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