import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import ImageLazyLoad from './widgets/ImageLazyLoad';

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
      commentCount: 0
    };
  }

  componentDidMount() {
    let { galleryItem, getRowCommentCount } = this.props;
    getRowCommentCount(galleryItem._id).then(res => {
      this.setState({commentCount: res.data.count});
    })
  }

  componentWillReceiveProps(nextProps) {
    let { galleryItem, getRowCommentCount } = this.props;
    if (galleryItem._id !== nextProps.galleryItem._id) {
      getRowCommentCount(nextProps.galleryItem._id).then(res => {
        this.setState({commentCount: res.data.count});
      })
    }
  }
  
  onRowExpand = () => {
    let { table,  galleryItem } = this.props;
    let row = this.props.getRow(table, galleryItem._id);
    window.app.onRowExpand(row, table);
  }

  render() {
    let { commentCount } = this.state;
    let { galleryItem, imageColumn, itemMarginRightNone } = this.props;
    let rowName = galleryItem['Name'] ? galleryItem['Name'] : intl.get('Unnamed_record');

    let itemImage;
    if (imageColumn) {
      let imageColumnName = imageColumn.name;
      if (galleryItem[imageColumnName] && galleryItem[imageColumnName].length > 0) {
        itemImage = <ImageLazyLoad imageUrl={galleryItem[imageColumnName][0]} />
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
      <div className="gallery-item" onClick={this.onRowExpand} style={style}>
        <div className="gallery-image-container">
          {itemImage}
        </div>
        <div className="text-truncate gallery-row-content">
          <span className="row-title">{rowName}</span>
          {commentCount !== 0 && 
            <div className="row-comment-content">
              <span className="dtable-font dtable-icon-comment row-comment-icon">
              </span>
              <span className="row-comment-count">{commentCount}</span>
            </div>
          }
        </div>
      </div>
    );
  }
}

GalleryViewItem.propTypes = propTypes;

export default GalleryViewItem;