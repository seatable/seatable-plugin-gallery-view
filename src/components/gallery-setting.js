import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { CellType } from 'dtable-utils';
import { DTableSwitch, FieldDisplaySetting } from 'dtable-ui-component';
import DtableSelect from './dtable-select';
import { SETTING_KEY, zIndexes } from '../constants';
import { calculateColumns, calculateColumnsName } from '../utils/utils';
import '../locale';

import '../assets/css/gallery-setting.css';

const propTypes = {
  tables: PropTypes.array,
  views: PropTypes.array,
  currentColumns: PropTypes.array,
  imageColumns: PropTypes.array,
  selectedTable: PropTypes.object,
  settings: PropTypes.object,
  onModifyGallerySettings: PropTypes.func,
  onHideGallerySetting: PropTypes.func,
};

const SHOW_TITLE_COLUMN_TYPE = [
  CellType.TEXT, CellType.SINGLE_SELECT, CellType.MULTIPLE_SELECT, CellType.NUMBER,
  CellType.FORMULA, CellType.LINK_FORMULA, CellType.DATE, CellType.COLLABORATOR,
  CellType.GEOLOCATION, CellType.CTIME, CellType.MTIME, CellType.CREATOR,
  CellType.LAST_MODIFIER, CellType.RATE,
];

class GallerySetting extends React.Component {

  constructor(props) {
    super(props);
    const { settings } = props;
    this.state = {
      isShowColumnName: settings.display_field_name || false,
    };
  }

  onModifySettings = (selectedOption) => {
    let { settings } = this.props;
    let { setting_key, value } = selectedOption;
    let updated;
    let modifyType = null;
    if (setting_key === SETTING_KEY.TABLE_NAME) {
      updated = {[setting_key]: value};  // Need init settings after select new table.
      modifyType = 'table';
    } else {
      updated = Object.assign({}, settings, {[setting_key]: value});
    }
    this.props.onModifyGallerySettings(updated, modifyType);
  };

  onColumnItemClick = (columnKey, value) => {
    const filteredColumns = this.getFilteredColumns();
    const column = filteredColumns.find(column => column.key === columnKey);
    let columnName = column.name;
    let { settings } = this.props;
    let { shown_column_names } = settings;
    let shownColumnNames = [];
    if (value) {
      if (!shown_column_names) {
        shownColumnNames.push(columnName);
      } else {
        shown_column_names.push(columnName);
        shownColumnNames = shown_column_names.slice(0);
      }
    } else {
      shownColumnNames = shown_column_names.filter(shownColumnName => shownColumnName !== columnName);
    }
    let updated = Object.assign({}, settings, {shown_column_names: shownColumnNames});
    this.props.onModifyGallerySettings(updated);
  };

  onChooseAllColumns = () => {
    const { settings } = this.props;
    let filteredColumns = this.getFilteredColumns();
    let shownColumnNames = [];
    filteredColumns.forEach(column => {
      shownColumnNames.push(column.name);
    });
    let updated = Object.assign({}, settings, {shown_column_names: shownColumnNames});
    this.props.onModifyGallerySettings(updated);
  };

  onHideAllColumns = () => {
    const { settings } = this.props;
    let updated = Object.assign({}, settings, {shown_column_names: []});
    this.props.onModifyGallerySettings(updated);
  };

  onToggleFieldsVisibility = (fieldAllShown) => {
    if (fieldAllShown) {
      this.onHideAllColumns();
    } else {
      this.onChooseAllColumns();
    }
  };

  onModifyFieldsSettings = (selectedOption) => {
    let { settings } = this.props;
    let { value, setting_key } = selectedOption;
    let updated = Object.assign({}, settings, {[setting_key]: value});
    this.props.onModifyGallerySettings(updated);
  };

  onMoveColumn = (sourceColumnKey, targetColumnKey) => {
    let { settings, currentColumns } = this.props;
    const source = currentColumns.find(column => column.key === sourceColumnKey).name;
    const target = currentColumns.find(column => column.key === targetColumnKey).name;
    let newColumnsName = calculateColumnsName(currentColumns, settings.column_name);
    let sourceIndex, targetIndex, movedColumnName, unMovedColumnsName = [];
    newColumnsName.forEach((column_name, index) => {
      if (column_name === source) {
        sourceIndex = index;
        movedColumnName = column_name;
      } else {
        if (column_name === target) {
          targetIndex = index;
        }
        unMovedColumnsName.push(column_name);
      }
    });
    let target_index = unMovedColumnsName.findIndex(column_name => column_name === target);
    if (sourceIndex < targetIndex) {
      target_index = target_index + 1;
    }
    unMovedColumnsName.splice(target_index, 0, movedColumnName);
    let updated = Object.assign({}, settings, {column_name: unMovedColumnsName});
    this.props.onModifyGallerySettings(updated);
  };

  showColumnNameToggle = () => {
    let { settings } = this.props;
    const updateShowColumnName = !this.state.isShowColumnName;
    let updated = Object.assign({}, settings, {display_field_name: updateShowColumnName});
    this.props.onModifyGallerySettings(updated);
    this.setState({isShowColumnName: updateShowColumnName});
  };

  getTitleColumns = () => {
    const { currentColumns } = this.props;
    return currentColumns.filter(column => SHOW_TITLE_COLUMN_TYPE.includes(column.type));
  };

  getFilteredColumns = () => {
    let { settings, currentColumns } = this.props;
    let filteredColumns = [];
    let { shown_title_name, shown_column_names = [] } = settings;
    let newColumnsName = calculateColumnsName(currentColumns, settings.column_name);
    let newColumns = calculateColumns(newColumnsName, currentColumns);
    if (!shown_title_name) {
      newColumns.forEach(column => {
        if (column.key !== '0000') {
          column.shown = shown_column_names.includes(column.name) ? true : false;
          filteredColumns.push(column);
        }
      });
    } else {
      newColumns.forEach(column => {
        if (column.name !== shown_title_name) {
          column.shown = shown_column_names.includes(column.name) ? true : false;
          filteredColumns.push(column);
        }
      });
    }
    return filteredColumns;
  };

  renderFieldsSelector = (source, settingKey) => {
    let { settings } = this.props;
    let options = source.map((item) => {
      let value = item.name;
      let label = item.name;
      return {value, label, setting_key: settingKey};
    });
    let selectedOption = options.find(item => item.value === settings[settingKey]);
    if (!selectedOption) {
      selectedOption = options[0];
    }
    return (
      <DtableSelect
        value={selectedOption}
        options={options}
        onChange={this.onModifyFieldsSettings}
      />
    );
  };

  renderSelector = (source, settingKey, valueKey, labelKey) => {
    let { settings } = this.props;
    let options = source.map((item) => {
      let value = item[valueKey];
      let label = item[labelKey];
      return {value, label, setting_key: settingKey};
    });
    let selectedOption = options.find(item => item.value === settings[settingKey]);
    if (!selectedOption && (settingKey === SETTING_KEY.TABLE_NAME || settingKey === SETTING_KEY.VIEW_NAME)) {
      selectedOption = options[0];
    }
    return (
      <DtableSelect
        value={selectedOption}
        options={options}
        onChange={this.onModifySettings}
      />
    );
  };

  render() {
    const { tables, views, onHideGallerySetting, imageColumns } = this.props;
    const { isShowColumnName } = this.state;
    const filteredColumns = this.getFilteredColumns();
    const titleColumns = this.getTitleColumns();
    const textProperties = {
      titleValue: intl.get('Other_fields_shown_in_gallery'),
      bannerValue: intl.get('Fields'),
      hideValue: intl.get('Hide_all'),
      showValue: intl.get('Show_all'),
    };
    const fieldAllShown = filteredColumns.every(column => column.shown);

    return (
      <div className="plugin-gallery-setting" style={{zIndex: zIndexes.GALLERY_SETTING}} ref={ref => this.GallerySetting = ref}>
        <div className="setting-container">
          <div className="setting-header-container">
            <div className="setting-header-wrapper">
              <h3 className="h5 m-0">{intl.get('Settings')}</h3>
              <i className="dtable-font dtable-icon-x btn-close" onClick={onHideGallerySetting}></i>
            </div>
          </div>
          <div className="setting-body">
            <div className="setting-list">
              <div className="setting-item table-setting">
                <div className="title">{intl.get('Table')}</div>
                {this.renderSelector(tables, SETTING_KEY.TABLE_NAME, 'name', 'name')}
              </div>
              <div className="setting-item view-setting">
                <div className="title">{intl.get('View')}</div>
                {this.renderSelector(views, SETTING_KEY.VIEW_NAME, 'name', 'name')}
              </div>
              <div className="split-line"></div>

              {imageColumns && imageColumns.length > 0 &&
                <div className="setting-item image-setting">
                  <div className="title">{intl.get('Image_field')}</div>
                  {this.renderFieldsSelector(imageColumns, 'shown_image_name')}
                </div>
              }
              <div className="setting-item">
                <div className="title">{intl.get('Title_field')}</div>
                {this.renderFieldsSelector(titleColumns, 'shown_title_name')}
              </div>

              <div className="split-line"></div>
              <div className="setting-item">
                <div className="gallery-setting-item">
                  <DTableSwitch
                    checked={isShowColumnName}
                    placeholder={intl.get('Show_field_names')}
                    onChange={this.showColumnNameToggle}
                    switchClassName='gallery-column-switch pl-0 gallery-switch-setting-item'
                  />
                </div>
              </div>

              <div className="split-line"></div>
              <FieldDisplaySetting
                fields={filteredColumns}
                textProperties={textProperties}
                fieldAllShown={fieldAllShown}
                onClickField={this.onColumnItemClick}
                onMoveField={this.onMoveColumn}
                onToggleFieldsVisibility={() => this.onToggleFieldsVisibility(fieldAllShown)}
              />

            </div>
          </div>
        </div>
      </div>
    );
  }
}

GallerySetting.propTypes = propTypes;

export default GallerySetting;
