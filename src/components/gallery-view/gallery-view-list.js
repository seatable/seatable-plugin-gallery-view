import React from 'react';
import PropTypes from 'prop-types';
import GalleryViewItem from './gallery-view-item';

const propTypes = {
  rows: PropTypes.array.isRequired,
  imageColumn: PropTypes.object,
  getRow: PropTypes.func,
  table: PropTypes.object,
  selectedGalleryView: PropTypes.object,
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

class GalleryViewList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      galleryItemWidth: 220
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
    let galleryItemWidth;
    const galleryListWidth = this.galleryListRef.offsetWidth;
    let galleryItemNumber = Math.floor(galleryListWidth / 236); //236 is galleryItem min-width and margin-right width
    let remainingWidth = galleryListWidth % 236;
    if (remainingWidth > 0) {
      galleryItemWidth = 220 + remainingWidth / galleryItemNumber;
    } else {
      galleryItemWidth = 220;
    }
    this.setState({
      galleryItemWidth: galleryItemWidth,
      galleryItemNumber: galleryItemNumber
    })
  }

  render() {
    const { rows, imageColumn } = this.props;
    const { galleryItemWidth,  galleryItemNumber } = this.state;

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
              selectedGalleryView={this.props.selectedGalleryView}
              width={galleryItemWidth}
              itemMarginRightNone={(index + 1) % galleryItemNumber === 0 ? true : false}
              currentColumns={this.props.currentColumns}
              settings={this.props.settings}
              selectedView={this.props.selectedView}
              getLinkCellValue={this.props.getLinkCellValue}
              getRowsByID={this.props.getRowsByID}
              getTableById={this.props.getTableById}
              collaborators={this.props.collaborators}
              getUserCommonInfo={this.props.getUserCommonInfo}
              getMediaUrl={this.props.getMediaUrl}
              CellType={this.props.CellType}
            />
          );
        })}
      </div>
    );
  }
}

GalleryViewList.propTypes = propTypes;

export default GalleryViewList;