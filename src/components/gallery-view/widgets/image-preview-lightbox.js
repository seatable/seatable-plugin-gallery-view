import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import * as zIndexes from '../../../constants/zIndexes';
import Lightbox from '@seafile/react-image-lightbox';
import '@seafile/react-image-lightbox/style.css';

function ImagePreviewerLightbox(props) {
  const { imageItems, imageIndex } = props;
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
      </Fragment>
    );
  }
  
  let PCtoolbarButtons = [];
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
};

export default ImagePreviewerLightbox;
