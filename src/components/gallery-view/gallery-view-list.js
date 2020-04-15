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
      emptyList: ['emptyItem1', 'emptyItem2', 'emptyItem3', 'emptyItem4', 'emptyItem5']
    };
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