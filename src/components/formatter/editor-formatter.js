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
  SimpleLongTextFormatter,
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
  ButtonFormatter,
} from 'dtable-ui-component';
import intl from 'react-intl-universal';
import { isValidEmail } from '../../utils/utils';

const propTypes = {
  displayColumnName: PropTypes.bool,
  type: PropTypes.string,
  column: PropTypes.object.isRequired,
  selectedView: PropTypes.object,
  columnIconConfig: PropTypes.object,
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
  formulaRows: PropTypes.object,
};

class EditorFormatter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDataLoaded: false,
      collaborator: null,
      emptyRowSelector: 'row-cell-empty d-inline-block',
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
  };

  getCollaborator = (value) => {
    if (!value) {
      this.setState({ isDataLoaded: true, collaborator: null });
      return;
    }
    this.setState({ isDataLoaded: false, collaborator: null });
    let { collaborators } = this.props;
    let collaborator =
      collaborators && collaborators.find((c) => c.email === value);
    if (collaborator) {
      this.setState({ isDataLoaded: true, collaborator: collaborator });
      return;
    }

    if (!isValidEmail(value)) {
      let mediaUrl = this.props.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({ isDataLoaded: true, collaborator: collaborator });
      return;
    }

    this.props
      .getUserCommonInfo(value)
      .then((res) => {
        collaborator = res.data;
        this.setState({ isDataLoaded: true, collaborator: collaborator });
      })
      .catch(() => {
        let mediaUrl = this.props.getMediaUrl();
        let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
        collaborator = {
          name: value,
          avatar_url: defaultAvatarUrl,
        };
        this.setState({ isDataLoaded: true, collaborator: collaborator });
      });
  };

  renderEmptyFormatter = () => {
    const { displayColumnName } = this.props;
    let emptyFormatter = (
      <span className='row-cell-empty d-inline-block'></span>
    );
    if (this.props.type === 'row_title') {
      emptyFormatter = <span>{intl.get('Unnamed_record')}</span>;
    }
    if (displayColumnName) {
      emptyFormatter = this.renderColumnFormatter(emptyFormatter);
    }
    return emptyFormatter;
  };

  renderColumnFormatter = (formatter) => {
    const { column } = this.props;
    const { name: columnName } = column;
    return (
      <>
        <div className='gallery-editor-title'>
          <span className='gallery-editor-title-text'>{columnName}</span>
        </div>
        <div style={{ minHeight: 28 }}>{formatter}</div>
      </>
    );
  };

  renderFormatter = () => {
    const { column, row, collaborators, CellType, displayColumnName } =
      this.props;
    const { type: columnType, key: columnKey } = column;
    const { isDataLoaded, collaborator } = this.state;
    const _this = this;

    switch (columnType) {
      case CellType.TEXT: {
        let textFormatter = (
          <TextFormatter
            value={row[columnKey]}
            containerClassName='gallery-text-editor'
          />
        );
        if (!row[columnKey]) {
          textFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          textFormatter = this.renderColumnFormatter(textFormatter);
        }
        return textFormatter;
      }
      case CellType.COLLABORATOR: {
        let collaboratorFormatter = (
          <CollaboratorFormatter
            value={row[columnKey]}
            collaborators={collaborators}
            containerClassName='gallery-text-editor'
          />
        );
        if (!row[columnKey] || row[columnKey].length === 0) {
          collaboratorFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          collaboratorFormatter = this.renderColumnFormatter(
            collaboratorFormatter
          );
        }
        return collaboratorFormatter;
      }
      case CellType.LONG_TEXT: {
        const outputValue = {
          ...row[columnKey],
          preview: row[columnKey]?.preview.substring(0, 200).trim() + '...',
        };
        let longTextFormatter = <SimpleLongTextFormatter value={outputValue} />;
        if (!row[columnKey]) {
          longTextFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          longTextFormatter = this.renderColumnFormatter(longTextFormatter);
        }
        return longTextFormatter;
      }
      case CellType.IMAGE: {
        let imageFormatter = <ImageFormatter value={row[columnKey]} isSample />;
        if (!row[columnKey] || row[columnKey].length === 0) {
          imageFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          imageFormatter = this.renderColumnFormatter(imageFormatter);
        }
        return imageFormatter;
      }
      case CellType.GEOLOCATION: {
        let geolocationFormatter = (
          <GeolocationFormatter
            value={row[columnKey]}
            containerClassName='gallery-text-editor'
          />
        );
        if (!row[columnKey]) {
          geolocationFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          geolocationFormatter =
            this.renderColumnFormatter(geolocationFormatter);
        }
        return geolocationFormatter;
      }
      case CellType.NUMBER: {
        let numberFormatter = (
          <NumberFormatter value={row[columnKey]} data={column.data} />
        );
        if (!row[columnKey]) {
          numberFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          numberFormatter = this.renderColumnFormatter(numberFormatter);
        }
        return numberFormatter;
      }
      case CellType.DATE: {
        let dateFormatter = (
          <DateFormatter value={row[columnKey]} format={column.data.format} />
        );
        if (!row[columnKey]) {
          dateFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          dateFormatter = this.renderColumnFormatter(dateFormatter);
        }
        return dateFormatter;
      }
      case CellType.MULTIPLE_SELECT: {
        const options = (column.data && column.data.options) || [];
        let multipleSelectFormatter = (
          <MultipleSelectFormatter value={row[columnKey]} options={options} />
        );
        if (!row[columnKey] || row[columnKey].length === 0) {
          multipleSelectFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          multipleSelectFormatter = this.renderColumnFormatter(
            multipleSelectFormatter
          );
        }
        return multipleSelectFormatter;
      }
      case CellType.SINGLE_SELECT: {
        const options = (column.data && column.data.options) || [];
        let singleSelectFormatter = (
          <SingleSelectFormatter value={row[columnKey]} options={options} />
        );
        if (!row[columnKey]) {
          singleSelectFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          singleSelectFormatter = this.renderColumnFormatter(
            singleSelectFormatter
          );
        }
        return singleSelectFormatter;
      }
      case CellType.FILE: {
        let fileFormatter = <FileFormatter value={row[columnKey]} isSample />;
        if (!row[columnKey] || row[columnKey].length === 0) {
          fileFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          fileFormatter = this.renderColumnFormatter(fileFormatter);
        }
        return fileFormatter;
      }
      case CellType.CHECKBOX: {
        let checkboxFormatter = <CheckboxFormatter value={row[columnKey]} />;
        if (displayColumnName) {
          checkboxFormatter = this.renderColumnFormatter(checkboxFormatter);
        }
        return checkboxFormatter;
      }
      case CellType.CTIME: {
        let cTimeFormatter = <CTimeFormatter value={row._ctime} />;
        if (!row._ctime) {
          cTimeFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          cTimeFormatter = this.renderColumnFormatter(cTimeFormatter);
        }
        return cTimeFormatter;
      }
      case CellType.MTIME: {
        let mTimeFormatter = <MTimeFormatter value={row._mtime} />;
        if (!row._mtime) {
          mTimeFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          mTimeFormatter = this.renderColumnFormatter(mTimeFormatter);
        }
        return mTimeFormatter;
      }
      case CellType.CREATOR: {
        if (!row._creator || !collaborator) return this.renderEmptyFormatter();
        if (isDataLoaded) {
          let creatorFormatter = (
            <CreatorFormatter
              collaborators={[collaborator]}
              value={row._creator}
            />
          );
          if (displayColumnName) {
            creatorFormatter = this.renderColumnFormatter(creatorFormatter);
          }
          return creatorFormatter;
        }
        return null;
      }
      case CellType.LAST_MODIFIER: {
        if (!row._last_modifier || !collaborator)
          return this.renderEmptyFormatter();
        if (isDataLoaded) {
          let lastModifierFormatter = (
            <LastModifierFormatter
              collaborators={[collaborator]}
              value={row._last_modifier}
            />
          );
          if (displayColumnName) {
            lastModifierFormatter = this.renderColumnFormatter(
              lastModifierFormatter
            );
          }
          return lastModifierFormatter;
        }
        return null;
      }
      case CellType.FORMULA:
      case CellType.LINK_FORMULA: {
        let formulaRows = this.props.formulaRows
          ? { ...this.props.formulaRows }
          : {};
        let formulaValue = formulaRows[row._id]
          ? formulaRows[row._id][columnKey]
          : '';
        let formulaFormatter = (
          <FormulaFormatter
            value={formulaValue}
            column={column}
            collaborators={collaborators}
            containerClassName='gallery-formula-container'
          />
        );
        if (!formulaValue) {
          formulaFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          formulaFormatter = this.renderColumnFormatter(formulaFormatter);
        }
        return formulaFormatter;
      }
      case CellType.LINK: {
        let linkMetaData = {
          getLinkedCellValue: function (linkId, table1Id, table2Id, row_id) {
            return _this.props.getLinkCellValue(
              linkId,
              table1Id,
              table2Id,
              row_id
            );
          },
          getLinkedRows: function (tableId, rowIds) {
            return _this.props.getRowsByID(tableId, rowIds);
          },
          getLinkedTable: function (tableId) {
            return _this.props.getTableById(tableId);
          },
          expandLinkedTableRow: function (row, tableId) {
            return false;
          },
        };
        let linkFormatter = (
          <LinkFormatter
            column={column}
            row={row}
            currentTableId={this.props.table._id}
            linkMetaData={linkMetaData}
            containerClassName='gallery-link-container'
          />
        );
        if (displayColumnName) {
          linkFormatter = this.renderColumnFormatter(linkFormatter);
        }
        return linkFormatter;
      }
      case CellType.AUTO_NUMBER: {
        let autoNumberFormatter = (
          <AutoNumberFormatter
            value={row[columnKey]}
            containerClassName='gallery-text-editor'
          />
        );
        if (!row[columnKey]) {
          autoNumberFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          autoNumberFormatter = this.renderColumnFormatter(autoNumberFormatter);
        }
        return autoNumberFormatter;
      }
      case CellType.URL: {
        let urlFormatter = (
          <UrlFormatter
            value={row[columnKey]}
            containerClassName='gallery-text-editor'
          />
        );
        if (!row[columnKey]) {
          urlFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          urlFormatter = this.renderColumnFormatter(urlFormatter);
        }
        return urlFormatter;
      }
      case CellType.EMAIL: {
        let emailFormatter = (
          <EmailFormatter
            value={row[columnKey]}
            containerClassName='gallery-text-editor'
          />
        );
        if (!row[columnKey]) {
          emailFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          emailFormatter = this.renderColumnFormatter(emailFormatter);
        }
        return emailFormatter;
      }
      case CellType.DURATION: {
        let durationFormatter = (
          <DurationFormatter
            value={row[columnKey]}
            format={column.data.duration_format}
            containerClassName='gallery-text-editor'
          />
        );
        if (!row[columnKey]) {
          durationFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          durationFormatter = this.renderColumnFormatter(durationFormatter);
        }
        return durationFormatter;
      }
      case CellType.RATE: {
        let rateFormatter = (
          <RateFormatter
            value={row[columnKey]}
            data={column.data}
            containerClassName='gallery-text-editor'
          />
        );
        if (!row[columnKey]) {
          rateFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          rateFormatter = this.renderColumnFormatter(rateFormatter);
        }
        return rateFormatter;
      }
      case CellType.BUTTON: {
        const { data = {} } = column;
        const optionColors = this.props.getOptionColors();
        let buttonFormatter = (
          <ButtonFormatter
            data={data}
            optionColors={optionColors}
            containerClassName='text-center'
          />
        );
        if (!data.button_name) {
          buttonFormatter = this.renderEmptyFormatter();
        } else if (displayColumnName) {
          buttonFormatter = this.renderColumnFormatter(buttonFormatter);
        }
        return buttonFormatter;
      }
      default:
        return null;
    }
  };

  render() {
    const childComponent = this.renderFormatter();
    if (childComponent.props.className !== this.state.emptyRowSelector) {
      return (
        <div
          className='gallery-editor-container'
          key={`editor-formatter-${this.props.index}`}
        >
          <Fragment>{this.renderFormatter()}</Fragment>
        </div>
      );
    }
    return null;
  }
}

EditorFormatter.propTypes = propTypes;

export default EditorFormatter;
