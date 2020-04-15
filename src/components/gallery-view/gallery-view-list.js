import React from 'react';
import PropTypes from 'prop-types';
import GalleryViewItem from './gallery-view-item';

const propTypes = {
  rows: PropTypes.array.isRequired,
  imageColumn: PropTypes.object,
  getRow: PropTypes.func,
  table: PropTypes.object,
  getRowCommentCount: PropTypes.func,
  selectedGalleryView: PropTypes.object,
};

class GalleryViewList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      emptyList: []
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  onResize = () => {
    let emptyList = [];
    let { rows } = this.props;
    const galleryListWidth = this.galleryListRef.offsetWidth;
    const rowsLength = rows.length;

    let galleryItemNumber = Math.floor(galleryListWidth / 250); //250 is galleryItem min-width and margin width
    let emptyItemLength = galleryItemNumber - (rowsLength % galleryItemNumber);
    if (emptyItemLength !== galleryItemNumber) {
      let index = 0; 
      while(index < emptyItemLength) {
        emptyList.push(index);
        index++;
      }
    }
    this.setState({
      emptyList: emptyList,
    });
  }

  render() {
    const { rows, imageColumn } = this.props;
    const { emptyList } = this.state;
    return (
      <div className="gallery-list" ref={ref => this.galleryListRef = ref}>
        {rows && rows.map((galleryItem, index) => {
          return (
            <GalleryViewItem 
              key={`galleryItem${index}`}
              galleryItem={galleryItem}
              imageColumn={imageColumn}
              getRow={this.props.getRow}
              table={this.props.table}
              getRowCommentCount={this.props.getRowCommentCount}
              selectedGalleryView={this.props.selectedGalleryView}
            />
          );
        })}
        {emptyList.length > 0 && emptyList.map((item, index) => {
          return <div key={`emptyaItem${index}`} className="empty-content"></div>;
        })}
       
      </div>
    );
  }
}

GalleryViewList.propTypes = propTypes;

export default GalleryViewList;