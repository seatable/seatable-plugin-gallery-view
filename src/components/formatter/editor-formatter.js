import React from 'react';
import PropTypes from 'prop-types';
import { 
  TextFormatter,
  NumberFormatter,
  CheckboxFormatter,
  DateFormatter,
  SingleSelectFormatter,
  MultipleSelectFormatter,
  CollaboratorFormatter,
  ImageFormatter,
  FileFormatter,
  LongTextFormatter,
  GeolocationFormatter,
  LinkFormatter,
  FormulaFormatter,
  CTimeFormatter,
  CreatorFormatter,
  LastModifierFormatter,
  MTimeFormatter
} from 'dtable-ui-component';
import { isValidEmail } from '../../utils/utils';

const emptyCell = <span className="row-cell-empty d-inline-block"></span>;

const propTypes = {
  column: PropTypes.object.isRequired,
  selectedView: PropTypes.object,
  row: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
  CellType: PropTypes.object,
  collaborators: PropTypes.array,
  getLinkCellValue: PropTypes.func,
  getRowsByID: PropTypes.func,
  getTableById: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getMediaUrl: PropTypes.func,
};

class EditorFormatter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isDataLoaded: false,
      collaborator: null
    }
  }

  componentDidMount() {
    const { row } = this.props;
    this.getCollaborator(row._creator);
    this.getCollaborator(row._last_modifier);
  }

  getCollaborator = (value) => {
    if (!value) {
      this.setState({isDataLoaded: true, collaborator: null});
      return;
    }
    let { collaborators } = this.props;
    let collaborator = collaborators && collaborators.find(c => c.email === value);
    if (collaborator) {
      this.setState({isDataLoaded: true, collaborator: collaborator});
      return;
    }

    if (!isValidEmail(value)) {
      let mediaUrl = this.props.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
      return;
    }
    
    this.props.getUserCommonInfo(value).then(res => {
      collaborator = res.data;
      this.setState({isDataLoaded: true, collaborator: collaborator});
    }).catch(() => {
      let mediaUrl = this.props.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
    });
  }

  renderFormatter = () => {
    const { column, row, collaborators, CellType } = this.props;
    let {type: columnType, key: columnKey} = column;
    const { isDataLoaded, collaborator } = this.state;
    const _this = this;
    
    switch(columnType) {
      case CellType.TEXT: {
        if (!row[columnKey]) return emptyCell;
        return <TextFormatter value={row[columnKey]} containerClassName="gallery-text-editor" />;
      }
      case CellType.COLLABORATOR: {
        if (!row[columnKey]) return emptyCell;
        return <CollaboratorFormatter value={row[columnKey]} collaborators={collaborators} />;
      }
      case CellType.LONG_TEXT: {
        if (!row[columnKey]) return emptyCell;
        return <LongTextFormatter value={row[columnKey]} containerClassName="gallery-text-editor" />;
      }
      case CellType.IMAGE: {
        if (!row[columnKey] || row[columnKey].length === 0) return emptyCell;
        return <ImageFormatter value={row[columnKey]} isSample />;
      }
      case CellType.GEOLOCATION : {
        if (!row[columnKey]) return emptyCell;
        return <GeolocationFormatter value={row[columnKey]} containerClassName="gallery-text-editor" />;
      }
      case CellType.NUMBER: {
        if (!row[columnKey]) return emptyCell;
        return <NumberFormatter value={row[columnKey]} format={column.data.format} />;
      }
      case CellType.DATE: {
        if (!row[columnKey]) return emptyCell;
        return <DateFormatter value={row[columnKey]} format={column.data.format} />;
      }
      case CellType.MULTIPLE_SELECT: {
        if (!row[columnKey]) return emptyCell;
        return <MultipleSelectFormatter value={row[columnKey]} options={column.data.options} />;
      }
      case CellType.SINGLE_SELECT: {
        if (!row[columnKey]) return emptyCell;
        return <SingleSelectFormatter value={row[columnKey]} options={column.data.options} />;
      }
      case CellType.FILE: {
        if (!row[columnKey] || row[columnKey].length === 0) return emptyCell;
        return <FileFormatter value={row[columnKey]} isSample />;
      }
      case CellType.CHECKBOX: {
        return <CheckboxFormatter value={row[columnKey]} />;
      }
      case CellType.CTIME: {
        if (!row._ctime) return emptyCell;
        return <CTimeFormatter value={row._ctime} />;
      }
      case CellType.MTIME: {
        if (!row._mtime) return emptyCell;
        return <MTimeFormatter value={row._mtime} />;
      }
      case CellType.CREATOR: {
        if (!row._creator) return emptyCell;
        if (isDataLoaded) {
          return <CreatorFormatter collaborators={[collaborator]} value={row._creator} />;
        }
        return null
      }
      case CellType.LAST_MODIFIER: {
        if (!row._last_modifier) return emptyCell;
        if (isDataLoaded) {
          return <LastModifierFormatter collaborators={[collaborator]} value={row._last_modifier} />;
        }
        return null
      }
      case CellType.FORMULA: {
        let formulaRows = this.props.selectedView.formula_rows;
        let formulaValue = formulaRows ? formulaRows[row._id][columnKey] : '';
        if (!formulaValue) return emptyCell;
        return <FormulaFormatter value={formulaValue} resultType={column.data.result_type} containerClassName="gallery-formula-container" />;
      }
      case CellType.LINK: {
        let linkMetaData = {
          getLinkedCellValue: function(linkId, table1Id, table2Id, row_id) {
            return _this.props.getLinkCellValue(linkId, table1Id, table2Id, row_id);
          },
          getLinkedRows: function(tableId, rowIds) {
            return _this.props.getRowsByID(tableId, rowIds);
          },
          getLinkedTable: function(tableId) {
            return _this.props.getTableById(tableId);
          },
          expandLinkedTableRow: function(row, tableId) {
            return false
          }
        }
        return <LinkFormatter column={column} row={row} currentTableId={this.props.table._id} linkMetaData={linkMetaData} containerClassName="gallery-link-container" />;
      }
      default:
        return null
    }
  }

  render() {
    return(
      <div className="gallery-editor-container">
        {this.renderFormatter()}
      </div>
    );
  }
}

EditorFormatter.propTypes = propTypes;

export default EditorFormatter;