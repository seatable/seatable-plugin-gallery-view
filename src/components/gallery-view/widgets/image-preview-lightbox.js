import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Lightbox from '@seafile/react-image-lightbox';
import * as zIndexes from '../../../constants/zIndexes';
import { checkSVGImage, isInternalImg, getImageThumbnailUrl, needUseThumbnailImage } from '../../../utils/utils';
import ModalPortal from '../../../components/dialog/modal-portal';

import '@seafile/react-image-lightbox/style.css';
import '../../../assets/css/image-previewer-ligntbox.css';

function ImagePreviewerLightbox(props) {
  const {
    imageItems,
    imageIndex,
    deleteImage,
    downloadImage,
    onRotateImage,
    moveToPrevRowImage,
    moveToNextRowImage,
    readOnly
  } = props;
  const imageItemsLength = imageItems.length;
  const URL = imageItems[imageIndex];
  
  // Handle URL has special symbol %$
  let imageTitle = '';
  try {
    imageTitle = URL ? decodeURI(URL.slice(URL.lastIndexOf('/') + 1)) : '';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  // svg image is vectorgraph and can't rotate, external image can't rotate
  const canRotateImage = onRotateImage && !readOnly && !checkSVGImage(URL) && isInternalImg(URL);

  let mainSrc = URL;
  if (needUseThumbnailImage(URL)) {
    mainSrc = getImageThumbnailUrl(URL, 512)
  }
  const imageTitleEl = (
    <span className="d-flex">
      <span className="text-truncate">{imageTitle}</span>
      <span className="flex-shrink-0">({imageIndex + 1}/{imageItemsLength})</span>
    </span>
  );
  if (window.isMobile) {
    return (
      <Fragment>
        <Lightbox
          isDesktop={false}
          wrapperClassName="mobile-image-previewer"
          mainSrc={mainSrc}
          nextSrc={imageItems[(imageIndex + 1) % imageItemsLength]}
          prevSrc={imageItems[(imageIndex + imageItemsLength - 1) % imageItemsLength]}
          onCloseRequest={props.closeImagePopup}
          onMovePrevRequest={props.moveToPrevImage}
          onMoveNextRequest={props.moveToNextImage}
          imagePadding={0}
          imageTitle={imageTitleEl}
          reactModalStyle={{
            overlay: {
              zIndex: zIndexes.IMAGE_PREVIEW_LIGHTBOX,
              backgroundColor: '#000',
            }
          }}
        />
        <ModalPortal>
          <div className="image-footer-choice mobile-image-footer-choice">
            <div className="image-footer-icon">
              <div className="d-flex">
                {canRotateImage && 
                  <span className="image-footer-choice-item mr-4" onClick={() => {onRotateImage(imageIndex, 90);}}>
                    <i className="dtable-font dtable-icon-rotate"></i>
                  </span>
                }
                {downloadImage && (
                  <span className="image-footer-choice-item" onClick={() => {downloadImage(URL);}}>
                    <i className="dtable-font dtable-icon-download"></i>
                  </span>
                )}
              </div>
              {(!readOnly && deleteImage) &&
                <span className="image-footer-choice-item" onClick={() => {deleteImage(imageIndex, 'previewer');}}>
                  <i className="dtable-font dtable-icon-delete"></i>
                </span>
              }
            </div>
          </div>
        </ModalPortal>
      </Fragment>
    );
  }

  let PCtoolbarButtons = [];
  if (moveToPrevRowImage) {
    PCtoolbarButtons.push(
      <button className='dtable-font dtable-icon-retract' onClick={() => {moveToPrevRowImage();}}></button>
    );
  }
  if (moveToNextRowImage) {
    PCtoolbarButtons.push(
      <button className='dtable-font dtable-icon-display' onClick={() => {moveToNextRowImage();}}></button>
    );
  }
  if (!readOnly && deleteImage) {
    PCtoolbarButtons.push(<button className='dtable-font dtable-icon-delete' onClick={() => {deleteImage(imageIndex, 'previewer');}}></button>);
  }
  if (downloadImage) {
    PCtoolbarButtons.push(<button className='dtable-font dtable-icon-download' onClick={() => {downloadImage(URL);}}></button>); 
  }
  return (
    <Lightbox
      wrapperClassName="PC-image-previewer"
      imageTitle={imageTitleEl}
      toolbarButtons={PCtoolbarButtons}
      mainSrc={mainSrc}
      nextSrc={imageItems[(imageIndex + 1) % imageItemsLength]}
      prevSrc={imageItems[(imageIndex + imageItemsLength - 1) % imageItemsLength]}
      onCloseRequest={props.closeImagePopup}
      onMovePrevRequest={props.moveToPrevImage}
      onMoveNextRequest={props.moveToNextImage}
      onRotateImage={canRotateImage ? (deg) => {onRotateImage(imageIndex, deg);} : null}
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
  moveToPrevRowImage: PropTypes.func,
  moveToNextRowImage: PropTypes.func,
  downloadImage: PropTypes.func,
  deleteImage: PropTypes.func,
  onRotateImage: PropTypes.func,
  readOnly: PropTypes.bool,
};

export default ImagePreviewerLightbox;
