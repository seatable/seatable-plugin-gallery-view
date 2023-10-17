import React from 'react';
import PropTypes from 'prop-types';
import Lightbox from '@seafile/react-image-lightbox';
import { getImageThumbnailUrl, needUseThumbnailImage } from '../../../utils/utils';

import '@seafile/react-image-lightbox/style.css';

function ImagePreviewerLightbox(props) {
  const { imageItems, imageIndex } = props;
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

  let mainSrc = URL;
  if (needUseThumbnailImage(URL)) {
    mainSrc = getImageThumbnailUrl(URL, 512);
  }
  const imageTitleEl = (
    <span className="d-flex">
      <span className="text-truncate">{imageTitle}</span>
      <span className="flex-shrink-0">({imageIndex + 1}/{imageItemsLength})</span>
    </span>
  );
  return (
    <Lightbox
      mainSrc={mainSrc}
      nextSrc={imageItems[(imageIndex + 1) % imageItemsLength]}
      prevSrc={imageItems[(imageIndex + imageItemsLength - 1) % imageItemsLength]}
      onCloseRequest={props.closeImagePopup}
      onMovePrevRequest={props.moveToPrevImage}
      onMoveNextRequest={props.moveToNextImage}
      imageTitle={imageTitleEl}
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
