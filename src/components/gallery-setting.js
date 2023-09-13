import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import DtableSelect from './dtable-select';
import { SETTING_KEY, zIndexes } from '../constants';
import GallerySettingItem from './setting/gallery-setting-item';
import { calculateColumns, calculateColumnsName } from '../utils/utils';
import Switch from './setting/switch';
import '../locale';

import '../assets/css/gallery-setting.css';

const propTypes = {
  tables: PropTypes.array,
  views: PropTypes.array,
  currentColumns: PropTypes.array,
  imageColumns: PropTypes.array,
  selectedTable: PropTypes.object,
  settings: PropTypes.object,
  CellType: PropTypes.object,
  onModifyGallerySettings: PropTypes.func,
  onHideGallerySetting: PropTypes.func,
  getColumnIconConfig: PropTypes.func,
  isFitMode: PropTypes.bool,
  onChangeFitMode: PropTypes.func,
};

const optionNoImage = {
  key: '',
  type: 'image',
  name: 'No image field',
  value: ''
};

class GallerySetting extends React.Component {

  constructor(props) {
    super(props);
    this.columnIconConfig = props.getColumnIconConfig();
    const { CellType, settings } = props;
    this.SHOW_TITLE_COLUMN_TYPE = [
      CellType.TEXT, CellType.SINGLE_SELECT, CellType.MULTIPLE_SELECT, CellType.NUMBER,
      CellType.FORMULA, CellType.LINK_FORMULA, CellType.DATE, CellType.COLLABORATOR,
      CellType.GEOLOCATION, CellType.CTIME, CellType.MTIME, CellType.CREATOR,
      CellType.LAST_MODIFIER, CellType.RATE
    ];
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

  onColumnItemClick = (column, value) => {
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
  }

  onChooseAllColumns = () => {
    const { settings } = this.props;
    let filteredColumns = this.getFilteredColumns();
    let shownColumnNames = [];
    filteredColumns.forEach(column => {
      shownColumnNames.push(column.name);
    });
    let updated = Object.assign({}, settings, {shown_column_names: shownColumnNames});
    this.props.onModifyGallerySettings(updated);
  }

  onHideAllColumns = () => {
    const { settings } = this.props;
    let updated = Object.assign({}, settings, {shown_column_names: []});
    this.props.onModifyGallerySettings(updated);
  }

  onModifyFieldsSettings = (selectedOption) => {
    let { settings } = this.props;
    let { value, setting_key } = selectedOption;
    let updated = Object.assign({}, settings, {[setting_key]: value});
    this.props.onModifyGallerySettings(updated);
  }

  onMoveColumn = (source, target) => {
    let { settings, currentColumns } = this.props;

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
  }

  showColumnNameToggle = () => {
    let { settings } = this.props;
    const updateShowColumnName = !this.state.isShowColumnName;
    let updated = Object.assign({}, settings, {display_field_name: updateShowColumnName});
    this.props.onModifyGallerySettings(updated);
    this.setState({isShowColumnName: updateShowColumnName});
  }

  getTitleColumns = () => {
    let { currentColumns } = this.props;
    let titleColumns = currentColumns.filter(column => this.SHOW_TITLE_COLUMN_TYPE.includes(column.type));
    return titleColumns;
  }

  getFilteredColumns = () => {
    let { settings, currentColumns } = this.props;
    let filteredColumns = [];
    let { shown_title_name } = settings;
    let newColumnsName = calculateColumnsName(currentColumns, settings.column_name);
    let newColumns = calculateColumns(newColumnsName, currentColumns);
    if (!shown_title_name) {
      filteredColumns = newColumns.filter(column => column.key !== '0000');
    } else {
      filteredColumns = newColumns.filter(column => column.name !== shown_title_name);
    }
    return filteredColumns;
  }

  renderChooseFields = () => {
    let filteredColumns = this.getFilteredColumns();
    let { settings } = this.props;
    let { shown_column_names } = settings;
    let isShowHideChoose = false;
    if (filteredColumns.length > 0 && shown_column_names && shown_column_names.length > 0) {
      isShowHideChoose = filteredColumns.every(column => {
        return shown_column_names.includes(column.name);
      });
      if (isShowHideChoose) {
        return <span className="setting-choose-all" onClick={this.onHideAllColumns}>{intl.get('Hide_all')}</span>;
      }
    }
    return <span className="setting-choose-all" onClick={this.onChooseAllColumns}>{intl.get('Show_all')}</span>;
  }

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
  }

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
  }

  getGalleryImageColumn = () => {
    const { settings, currentColumns } = this.props;
    const { shown_image_name } = settings;
    let imageColumn;
    if (shown_image_name) {
      imageColumn = currentColumns.find(
        (column) => column.name === shown_image_name
      );
    }
    return imageColumn;
  }

  render() {
    const { tables, views, onHideGallerySetting, settings, imageColumns, onChangeFitMode, isFitMode } = this.props;
    const { isShowColumnName } = this.state;
    const filteredColumns = this.getFilteredColumns();
    const titleColumns = this.getTitleColumns();
    const selectedImageColumn = this.getGalleryImageColumn();
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
                  <div className="title">
                    {intl.get('Image_field')}
                    {selectedImageColumn && (
                      <Switch
                        checked={isFitMode}
                        placeholder={<span className="mr-2">Crop</span>}
                        placeholder2="Fit"
                        onChange={onChangeFitMode}
                        showTwoLabel
                        switchClassName="gallery-setting-crop-fit-mode"
                      />
                    )}
                  </div>
                  {this.renderFieldsSelector([optionNoImage, ...imageColumns], 'shown_image_name')}
                </div>
              }
              <div className="setting-item">
                <div className="title">{intl.get('Title_field')}</div>
                {this.renderFieldsSelector(titleColumns, 'shown_title_name')}
              </div>


              <div className="setting-item fields-setting">
                <div className="fields-setting-header">
                  <span>{intl.get('Other_fields')}</span>
                  {this.renderChooseFields()}
                </div>
                <div className="fields-setting-body">
                  {filteredColumns.map((column, index) => {
                    return (
                      <GallerySettingItem
                        key={`gallery-setting-item${index}`}
                        column={column}
                        onColumnItemClick={this.onColumnItemClick}
                        settings={settings.shown_column_names || []}
                        onMoveColumn={this.onMoveColumn}
                        selectedTable={this.props.selectedTable}
                        columnIconConfig={this.columnIconConfig}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="split-line"></div>
              <div className="setting-item">
                <div className="gallery-setting-item">
                  <Switch
                    checked={isShowColumnName}
                    placeholder={intl.get('Show_field_names')}
                    onChange={this.showColumnNameToggle}
                    switchClassName='pl-0 gallery-switch-setting-item'
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

GallerySetting.propTypes = propTypes;

export default GallerySetting;
