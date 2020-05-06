import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import * as zIndexes from '../../../constants/zIndexes';
import Lightbox from '@seafile/react-image-lightbox';
import '@seafile/react-image-lightbox/style.css';
// import '../css/image-previewer-ligntbox.css';

function ImagePreviewerLightbox(props) {
  const isReadOnly = window.dtable && window.dtable.permission === 'r';
  const { imageItems, imageIndex, deleteImage, downloadImage, onRotateImage } = props;
  const imageItemsLength = imageItems.length;
  const URL = imageItems[imageIndex];
  const imageTitle = URL ? decodeURI(URL.slice(URL.lastIndexOf('/') + 1)) : '';
  if (window.isMobile) {
    return (
      <Fragment>
        <Lightbox
          wrapperClassName="mobile-image-previewer"
          mainSrc={imageItems[imageIndex]}
          nextSrc={imageItems[(imageIndex + 1) % imageItemsLength]}
          prevSrc={imageItems[(imageIndex + imageItemsLength - 1) % imageItemsLength]}
          onCloseRequest={props.closeImagePopup}
          onMovePrevRequest={props.moveToPrevImage}
          onMoveNextRequest={props.moveToNextImage}
          imagePadding={0}
          animationDisabled={true}
          imageTitle={imageTitle}
          reactModalStyle={{
            overlay: {
              zIndex: zIndexes.IMAGE_PREVIEW_LIGHTBOX,
              backgroundColor: '#000',
              height: 'calc(100% - 100px)',
            }
          }}
        />
        <div className="image-footer-choice mobile-image-footer-choice">
          <div className="image-footer-icon">
            {!isReadOnly && 
              <span className="image-footer-choice-item" onClick={() => {deleteImage(imageIndex, 'previewer');}}>
                <i className="dtable-font dtable-icon-delete"></i>
              </span>
            }
            <span className="image-footer-choice-item" onClick={() => {downloadImage(URL);}}>
              <i className="dtable-font dtable-icon-download"></i>
            </span>
            {(!isReadOnly && onRotateImage) && 
              <span className="image-footer-choice-item" onClick={(deg) => {onRotateImage(imageIndex, deg);}}>
                <i className="dtable-font dtable-icon-rotate"></i>
              </span>
            }
          </div>
        </div>
      </Fragment>
    );
  }
  
  let PCtoolbarButtons = [];
  if (!isReadOnly && deleteImage) {
    PCtoolbarButtons.push(<button className='dtable-font dtable-icon-delete' onClick={() => {deleteImage(imageIndex, 'previewer');}}></button>);
  }
  if (downloadImage) {
    PCtoolbarButtons.push(<button className='dtable-font dtable-icon-download' onClick={() => {downloadImage(URL);}}></button>); 
  }
  return (
    <Lightbox
      wrapperClassName="PC-image-previewer"
      imageTitle={imageTitle}
      toolbarButtons={PCtoolbarButtons}
      mainSrc={imageItems[imageIndex]}
      nextSrc={imageItems[(imageIndex + 1) % imageItemsLength]}
      prevSrc={imageItems[(imageIndex + imageItemsLength - 1) % imageItemsLength]}
      onCloseRequest={props.closeImagePopup}
      onMovePrevRequest={props.moveToPrevImage}
      onMoveNextRequest={props.moveToNextImage}
      onRotateImage={(onRotateImage && !isReadOnly) ? (deg) => {onRotateImage(imageIndex, deg);} : null}
      imagePadding={70}
      reactModalStyle={{
        overlay: {
          zIndex: zIndexes.IMAGE_PREVIEW_LIGHTBOX
        }
      }}
    />
  );
}

ImagePreviewerLightbox.propTypes = {
  imageItems: PropTypes.array.isRequired,
  imageIndex: PropTypes.number.isRequired,
  closeImagePopup: PropTypes.func.isRequired,
  moveToPrevImage: PropTypes.func.isRequired,
  moveToNextImage: PropTypes.func.isRequired,
  downloadImage: PropTypes.func,
  deleteImage: PropTypes.func,
  onRotateImage: PropTypes.func,
};

export default ImagePreviewerLightbox;
