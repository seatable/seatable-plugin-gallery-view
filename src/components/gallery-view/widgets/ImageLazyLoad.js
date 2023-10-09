import React from 'react';
import PropTypes from 'prop-types';
import Loading from '../../loading';

const propTypes = {
  imageUrl: PropTypes.string.isRequired,
  onImageClick: PropTypes.func,
};

class ImageLazyLoad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: props.imageUrl,
      imageList: props.imageUrlsArr,
      loadedCount: 0,
      isShowLoading: false,
    };
    window.console.log('props in image lazy', this.imageList);
  }

  componentDidMount() {
    let { imageUrl } = this.state;
    this.loadImageAsync(imageUrl, (image) => {
      this.setState({ imageUrl: image.src });
    });
  }

  componentWillReceiveProps(nextProps) {
    let newImageUrl = nextProps.imageUrl;
    if (this.isArrayEqual(newImageUrl, this.props.imageUrl)) return;
    this.loadImageAsync(newImageUrl, (image) => {
      this.setState({ imageUrl: image.src });
    });
  }

  componentWillUnmount() {
    // prevent async operation
    this.setState = (state, callback) => {
      return;
    };
  }

  isArrayEqual = (array1, array2) => {
    return array1.toString() === array2.toString();
  };

  loadImageAsync = (url, resolve, reject) => {
    if (!url) {
      reject('img path is require');
      return;
    }
    this.setState({ isShowLoading: true });
    const image = new Image();
    image.src = url;
    image.onload = () => {
      resolve(image);
      this.setState({ isShowLoading: false });
    };
    image.onerror = () => {
      this.setState({ isShowLoading: false });
    };
  };

  onMouseDown = (event) => {
    event.stopPropagation();
  };

  onImageClick = (event) => {
    this.props.onImageClick(event, 0);
  };

  render() {
    let { imageList, imageUrl, isShowLoading } = this.state;

    if (!imageUrl) {
      return '';
    }

    if (isShowLoading) {
      return <Loading />;
    }

    return (
      <div className='horizontal-scroll-preview'>
        {imageList.map((imageUrl, index) => (
          <img
            alt=''
            key={index}
            src={imageUrl}
            onMouseDown={this.onMouseDown}
            onClick={() => this.onImageClick(imageUrl)}
          />
        ))}
      </div>
    );
  }
}

ImageLazyLoad.propTypes = propTypes;

export default ImageLazyLoad;
