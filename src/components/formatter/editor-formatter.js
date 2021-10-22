import React, { Fragment } from 'react';
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
  MTimeFormatter,
  AutoNumberFormatter,
  UrlFormatter,
  EmailFormatter,
  DurationFormatter,
  RateFormatter,
  ButtonFormatter
} from 'dtable-ui-component';
import intl from 'react-intl-universal';
import { isValidEmail } from '../../utils/utils';

const propTypes = {
  displayColumnName: PropTypes.bool,
  type: PropTypes.string,
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
  getOptionColors: PropTypes.func,
};

class EditorFormatter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isDataLoaded: false,
      collaborator: null
    };
  }

  componentDidMount() {
    this.calculateCollaboratorData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.calculateCollaboratorData(nextProps);
  }

  calculateCollaboratorData = (props) => {
    const { row, column, CellType } = props;
    if (column.type === CellType.LAST_MODIFIER) {
      this.getCollaborator(row._last_modifier);
    } else if (column.type === CellType.CREATOR) {
      this.getCollaborator(row._creator);
    }
  }

  getCollaborator = (value) => {
    if (!value) {
      this.setState({isDataLoaded: true, collaborator: null});
      return;
    }
    this.setState({isDataLoaded: false, collaborator: null});
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

  renderEmptyFormatter = () => {
    const { displayColumnName } = this.props;
    let emptyFormatter = <span className="row-cell-empty d-inline-block"></span>;
    if (this.props.type === 'row_title') {
      emptyFormatter = <span>{intl.get('Unnamed_record')}</span>;
    }
    if (displayColumnName) return this.renderColumnFormatter(emptyFormatter);
    return emptyFormatter;
  }

  renderColumnFormatter = (formatter) => {
    const { column } = this.props;
    const { name: columnName } = column;
    return (
      <>
        <span className="mr-2">{columnName}: </span>
        {formatter}
      </>
    );
  }

  renderFormatter = () => {
    const { column, row, collaborators, CellType, displayColumnName } = this.props;
    const { type: columnType, key: columnKey } = column;
    const { isDataLoaded, collaborator } = this.state;
    const _this = this;

    switch(columnType) {
      case CellType.TEXT: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        const textFormatter = <TextFormatter value={row[columnKey]} containerClassName="gallery-text-editor" />;
        if (displayColumnName) return this.renderColumnFormatter(textFormatter);
        return textFormatter;
      }
      case CellType.COLLABORATOR: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        const collaboratorFormatter = <CollaboratorFormatter value={row[columnKey]} collaborators={collaborators} />;
        if (displayColumnName) return this.renderColumnFormatter(collaboratorFormatter);
        return collaboratorFormatter;
      }
      case CellType.LONG_TEXT: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        const longTextFormatter = <LongTextFormatter value={row[columnKey]} />;
        if (displayColumnName) return this.renderColumnFormatter(longTextFormatter);
        return longTextFormatter;
      }
      case CellType.IMAGE: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        const imageFormatter = <ImageFormatter value={row[columnKey]} isSample />;
        if (displayColumnName) return this.renderColumnFormatter(imageFormatter);
        return imageFormatter;
      }
      case CellType.GEOLOCATION : {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        const geolocationFormatter = <GeolocationFormatter value={row[columnKey]} containerClassName="gallery-text-editor" />;
        if (displayColumnName) return this.renderColumnFormatter(geolocationFormatter);
        return geolocationFormatter;
      }
      case CellType.NUMBER: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        const numberFormatter = <NumberFormatter value={row[columnKey]} data={column.data} />;
        if (displayColumnName) return this.renderColumnFormatter(numberFormatter);
        return numberFormatter;
      }
      case CellType.DATE: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        const dateFormatter = <DateFormatter value={row[columnKey]} format={column.data.format} />;
        if (displayColumnName) return this.renderColumnFormatter(dateFormatter);
        return dateFormatter;
      }
      case CellType.MULTIPLE_SELECT: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        const multipleSelectFormatter = <MultipleSelectFormatter value={row[columnKey]} options={column.data.options} />;
        if (displayColumnName) return this.renderColumnFormatter(multipleSelectFormatter);
        return multipleSelectFormatter;
      }
      case CellType.SINGLE_SELECT: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        const singleSelectFormatter = <SingleSelectFormatter value={row[columnKey]} options={column.data.options} />;
        if (displayColumnName) return this.renderColumnFormatter(singleSelectFormatter);
        return singleSelectFormatter;
      }
      case CellType.FILE: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        const fileFormatter = <FileFormatter value={row[columnKey]} isSample />;
        if (displayColumnName) return this.renderColumnFormatter(fileFormatter);
        return fileFormatter;
      }
      case CellType.CHECKBOX: {
        const checkboxFormatter = <CheckboxFormatter value={row[columnKey]} />;
        if (displayColumnName) return this.renderColumnFormatter(checkboxFormatter);
        return checkboxFormatter;
      }
      case CellType.CTIME: {
        if (!row._ctime) return this.renderEmptyFormatter();
        const cTimeFormatter = <CTimeFormatter value={row._ctime} />;
        if (displayColumnName) return this.renderColumnFormatter(cTimeFormatter);
        return cTimeFormatter;
      }
      case CellType.MTIME: {
        if (!row._mtime) return this.renderEmptyFormatter();
        const mTimeFormatter = <MTimeFormatter value={row._mtime} />;
        if (displayColumnName) return this.renderColumnFormatter(mTimeFormatter);
        return mTimeFormatter;
      }
      case CellType.CREATOR: {
        if (!row._creator || !collaborator) return this.renderEmptyFormatter();
        if (isDataLoaded) {
          const creatorFormatter = <CreatorFormatter collaborators={[collaborator]} value={row._creator} />;
          if (displayColumnName) return this.renderColumnFormatter(creatorFormatter);
          return creatorFormatter;
        }
        return null;
      }
      case CellType.LAST_MODIFIER: {
        if (!row._last_modifier || !collaborator) return this.renderEmptyFormatter();
        if (isDataLoaded) {
          const lastModifierFormatter = <LastModifierFormatter collaborators={[collaborator]} value={row._last_modifier} />;
          if (displayColumnName) return this.renderColumnFormatter(lastModifierFormatter);
          return lastModifierFormatter;
        }
        return null;
      }
      case CellType.FORMULA:
      case CellType.LINK_FORMULA: {
        let formulaRows = this.props.formulaRows ? {...this.props.formulaRows} : {};
        let formulaValue = formulaRows[row._id] ? formulaRows[row._id][columnKey] : '';
        if (!formulaValue) return this.renderEmptyFormatter();
        const formulaFormatter = <FormulaFormatter value={formulaValue} column={column} collaborators={collaborators} containerClassName="gallery-formula-container" />;
        if (displayColumnName) return this.renderColumnFormatter(formulaFormatter);
        return formulaFormatter;
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
            return false;
          }
        };
        const linkFormatter = <LinkFormatter column={column} row={row} currentTableId={this.props.table._id} linkMetaData={linkMetaData} containerClassName="gallery-link-container" />;
        if (displayColumnName) return this.renderColumnFormatter(linkFormatter);
        return linkFormatter;
      }
      case CellType.AUTO_NUMBER: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        const autoNumberFormatter = <AutoNumberFormatter value={row[columnKey]} containerClassName="gallery-text-editor" />;
        if (displayColumnName) return this.renderColumnFormatter(autoNumberFormatter);
        return autoNumberFormatter;
      }
      case CellType.URL: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        const urlFormatter = <UrlFormatter value={row[columnKey]} containerClassName="gallery-text-editor" />;
        if (displayColumnName) return this.renderColumnFormatter(urlFormatter);
        return urlFormatter;
      }
      case CellType.EMAIL: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        const emailFormatter = <EmailFormatter value={row[columnKey]} containerClassName="gallery-text-editor" />;
        if (displayColumnName) return this.renderColumnFormatter(emailFormatter);
        return emailFormatter;
      }
      case CellType.DURATION: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        const durationFormatter = <DurationFormatter value={row[columnKey]} format={column.data.duration_format} containerClassName="gallery-text-editor" />;
        if (displayColumnName) return this.renderColumnFormatter(durationFormatter);
        return durationFormatter;
      }
      case CellType.RATE: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        const rateFormatter = <RateFormatter value={row[columnKey]} data={column.data} containerClassName="gallery-text-editor" />;
        if (displayColumnName) return this.renderColumnFormatter(rateFormatter);
        return rateFormatter;
      }
      case CellType.BUTTON: {
        const { data = {} } = column;
        const optionColors = this.props.getOptionColors();
        if (!data.button_name) return this.renderEmptyFormatter();
        const buttonFormatter = <ButtonFormatter data={data} optionColors={optionColors} containerClassName="text-center" />;
        if (displayColumnName) return this.renderColumnFormatter(buttonFormatter);
        return buttonFormatter;
      }
      default:
        return null;
    }
  }

  render() {
    return(
      <Fragment>
        {this.renderFormatter()}
      </Fragment>
    );
  }
}

EditorFormatter.propTypes = propTypes;

export default EditorFormatter;