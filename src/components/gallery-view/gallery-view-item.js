import React from 'react';
import PropTypes from 'prop-types';
import ImageLazyLoad from './widgets/ImageLazyLoad';
import ImagePreviewerLightbox from './widgets/image-preview-lightbox';
import EditorFormatter from '../formatter/editor-formatter';
import { formatNumberToString } from '../../utils/value-format-utils';
import { isValidEmail } from '../../utils/utils';
import moment from 'moment';

const propTypes = {
  galleryItem: PropTypes.object,
  imageColumn: PropTypes.object,
  getRow: PropTypes.func,
  table: PropTypes.object,
  selectedGalleryView: PropTypes.object,
  width: PropTypes.number,
  itemMarginRightNone: PropTypes.bool,
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

const CREATOR = 'creator';

class GalleryViewItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowLargeImage: false,
      canOpenImage: false,
      largeImageIndex: '',
      images: [], 
      isDataLoaded: false, 
      creatorCollaborator: null,
      lastModifierCollaborator: null,
      isCreatorLoaded: false,
      collaborator: null
    };
  }

  componentDidMount() {
    const { galleryItem, table } = this.props;
    let row = this.props.getRow(table, galleryItem._id);
    this.getCollaborator(row._creator, CREATOR);
    this.getCollaborator(row._last_modifier);
  }

   getCollaborator = (value, type) => {
    if (!value) {
      if (type === CREATOR) {
        this.setState({isCreatorLoaded: true, creatorCollaborator: null})
      } else {
        this.setState({isDataLoaded: true, lastModifierCollaborator: null})
      }
      return;
    }
    let { collaborators } = this.props;
    let collaborator = collaborators && collaborators.find(c => c.email === value);
    if (collaborator) {
      if (type === CREATOR) {
        this.setState({isCreatorLoaded: true, creatorCollaborator: collaborator})
      } else {
        this.setState({isDataLoaded: true, lastModifierCollaborator: collaborator})
      }
      return;
    }

    if (!isValidEmail(value)) {
      let mediaUrl = this.props.getMediaUrl();

      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      if (type === CREATOR) {
        this.setState({isCreatorLoaded: true, creatorCollaborator: collaborator})
      } else {
        this.setState({isDataLoaded: true, lastModifierCollaborator: collaborator})
      }
      return;
    }

    this.props.getUserCommonInfo(value).then(res => {
      collaborator = res.data;
      if (type === CREATOR) {
        this.setState({isCreatorLoaded: true, creatorCollaborator: collaborator})
      } else {
        this.setState({isDataLoaded: true, lastModifierCollaborator: collaborator})
      }
    }).catch(() => {
      let mediaUrl = this.props.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      if (type === CREATOR) {
        this.setState({isCreatorLoaded: true, creatorCollaborator: collaborator})
      } else {
        this.setState({isDataLoaded: true, lastModifierCollaborator: collaborator})
      }
    });
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

  getGalleryImageColumn = () => {
    const { settings, currentColumns } = this.props;
    const { shown_image_name } = settings;
    let imageColumn;
    if (!shown_image_name) {
      imageColumn = currentColumns.find(column => column.type === 'image');
    } else {
      imageColumn = currentColumns.find(column => column.name === shown_image_name);
    }
    return imageColumn;
  }

  getGalleryTitleColumn = () => {
    const { settings, currentColumns } = this.props;
    const { shown_title_name } = settings;
    let titleColumn;
    if (!shown_title_name) {
      titleColumn = currentColumns.find(column => column.key === '0000');
    } else {
      titleColumn = currentColumns.find(column => column.name === shown_title_name);
    }
    if (!titleColumn) {
      titleColumn = currentColumns.find(column => column.key === '0000');
    }
    return titleColumn;
  }

  getFilteredColumns = () => {
    const { settings, currentColumns } = this.props;
    const { shown_column_names, shown_title_name } = settings;
    let filteredColumns = [];
    if (shown_column_names) {
      filteredColumns = currentColumns.filter(item => {
        return shown_column_names.some(showColumnName => {
          return item.name === showColumnName && showColumnName !== shown_title_name });
      }); 
    }
    return filteredColumns;
  }

  renderEditorFormatter = () => {
    let { galleryItem, table } = this.props;
    let filteredColumns = this.getFilteredColumns();
    let row = this.props.getRow(table, galleryItem._id);
    return filteredColumns.map((column, index) => {
      return (
        <div className="gallery-editor-container">
          <EditorFormatter
            key={`editor-formatter-${index}`}
            column={column}
            selectedView={this.props.selectedView}
            row={row}
            table={table}
            getLinkCellValue={this.props.getLinkCellValue}
            getRowsByID={this.props.getRowsByID}
            getTableById={this.props.getTableById}
            collaborators={this.props.collaborators}
            getUserCommonInfo={this.props.getUserCommonInfo}
            getMediaUrl={this.props.getMediaUrl}
            CellType={this.props.CellType}
          /></div>);
    })
  }

  renderRowTitle = () => {
    let titleColumn = this.getGalleryTitleColumn();
    const { galleryItem, table } = this.props;
    let row = this.props.getRow(table, galleryItem._id);
    return (<div className="row-title" onClick={this.onRowExpand}>
      <EditorFormatter
        column={titleColumn}
        selectedView={this.props.selectedView}
        row={row}
        table={table}
        getLinkCellValue={this.props.getLinkCellValue}
        getRowsByID={this.props.getRowsByID}
        getTableById={this.props.getTableById}
        collaborators={this.props.collaborators}
        getUserCommonInfo={this.props.getUserCommonInfo}
        getMediaUrl={this.props.getMediaUrl}
        CellType={this.props.CellType}
        type="row_title"
      />
    </div>);
  }

  getTitleValue = () => {
    let titleColumn = this.getGalleryTitleColumn();
    const { collaborators, CellType, galleryItem, table } = this.props;
    let {type: columnType, key: columnKey} = titleColumn;
    let row = this.props.getRow(table, galleryItem._id);
    let titleValue = '';
    switch(columnType) {
      case CellType.TEXT: {
        titleValue = row[columnKey];
        break;
      }
      case CellType.COLLABORATOR: {
        let value = row[columnKey];
        if (!Array.isArray(row[columnKey])) {
          value = [row[columnKey]];
        }
        if (value) {
          value.forEach(email => {
            let collaborator = collaborators.find(collaborator => collaborator.email === email);
            if (collaborator) {
              titleValue += `${collaborator.name} `;
            }
          });
        }
        break;
      }
      case CellType.GEOLOCATION : {
        let value=row[columnKey];
        if (value) {
          titleValue = `${value.province || ''} ${value.city || ''} ${value.district || ''} ${value.detail || ''}`;
        }
        break;
      }
      case CellType.NUMBER: {
        if (row[columnKey]) {
          titleValue = formatNumberToString(row[columnKey], titleColumn.data.format);
        }
        break;
      }
      case CellType.DATE: {
        titleValue = row[columnKey];
        break;
      }
      case CellType.MULTIPLE_SELECT: {
        let value = row[columnKey];
        if (value) {
          let options = titleColumn.data.options;
          value.forEach(optionID => {
            let option = options.find(item => item.id === optionID);
            if (option) {
              titleValue += `${option.name} `;
            }
          });
        }
        break;
      }
      case CellType.SINGLE_SELECT: {
        let value = row[columnKey];
        if (value) {
          let options = titleColumn.data.options
          let option  = options.find(item => item.id === value);
          titleValue = option.name;
        }
        break;
      }
      case CellType.CTIME: {
        if (row._ctime) {
          titleValue = moment(row._ctime).format('YYYY-MM-DD HH:mm:ss');       
        }
        break;
      }
      case CellType.MTIME: {
        if (row._mtime) {
          titleValue = moment(row._mtime).format('YYYY-MM-DD HH:mm:ss');        
        }
        break;
      }
      case CellType.CREATOR: {
        if (this.state.isCreatorLoaded) {
          if (this.state.creatorCollaborator) {
            titleValue = this.state.creatorCollaborator.name;
          }
        }
        break;
      }
      case CellType.LAST_MODIFIER: {
        if (this.state.isDataLoaded) {
          titleValue = this.state.lastModifierCollaborator.name;
        }
        break;
      }
      case CellType.FORMULA: {
        let formulaRows = this.props.selectedView.formula_rows;
        let formulaValue = formulaRows ? formulaRows[row._id][columnKey] : '';
        titleValue = Object.prototype.toString.call(formulaValue) === '[object Boolean]' ? '' : formulaValue;
        break;
      }
      default:
        return null;
    }
    return titleValue;
  }

  render() {
    let { images, largeImageIndex } = this.state;
    let { galleryItem, itemMarginRightNone } = this.props;
    let selectedImageColumn = this.getGalleryImageColumn();
    let itemImage;
    let imageNumber = 0;
    if (selectedImageColumn) {
      let imageColumnName = selectedImageColumn.name;
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
          {this.renderRowTitle()}
          <div className="gallery-formatter-list">
            {this.renderEditorFormatter()}

          </div>
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