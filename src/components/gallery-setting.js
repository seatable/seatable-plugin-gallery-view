import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import PluginSelect from './plugin-select';
import { SETTING_KEY, zIndexes, CELL_TYPE } from '../constants';
import GallerySettingItem from './setting/gallery-setting-item';
import '../locale';

import '../css/gallery-setting.css';

const propTypes = {
  tables: PropTypes.array,
  views: PropTypes.array,
  userColumns: PropTypes.array,
  dateColumns: PropTypes.array,
  currentColumns: PropTypes.array,
  settings: PropTypes.object,
  onModifyGallerySettings: PropTypes.func,
  onHideGallerySetting: PropTypes.func,
};

const SHOW_TITLE_SELECT = [CELL_TYPE.TEXT, CELL_TYPE.SINGLE_SELECT, CELL_TYPE.MULTIPLE_SELECT, CELL_TYPE.NUMBER, CELL_TYPE.FORMULA,
  CELL_TYPE.DATE, CELL_TYPE.COLLABORATOR, CELL_TYPE.GEOLOCATION, CELL_TYPE.CTIME, CELL_TYPE.MTIME, CELL_TYPE.CREATOR, 
  CELL_TYPE.LAST_MODIFIER];

class GallerySetting extends React.Component {

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
    return <PluginSelect
      value={selectedOption}
      options={options}
      onChange={this.onModifySettings}
    />
  }

  onModifySettings = (selectedOption) => {
    let { settings } = this.props;
    let { setting_key, value } = selectedOption;
    let updated;
    let modifyType = null;
    if (setting_key === SETTING_KEY.TABLE_NAME) {
      updated = {[setting_key]: value};  // Need init settings after select new table.
      modifyType = 'table'
    } else {
      updated = Object.assign({}, settings, {[setting_key]: value});
    }
    this.props.onModifyGallerySettings(updated, modifyType);
  };

  onColumnItemClick = (column, value) => {
    let columnName = column.name;
    let { settings } = this.props;
    let { is_show_row_item } = settings;
    let itemUpdated;
    if (!is_show_row_item) {
      itemUpdated = {[columnName]: value};
    } else {
      itemUpdated = Object.assign({}, is_show_row_item, {[columnName]: value});
    }
    let updated = Object.assign({}, settings, {is_show_row_item: itemUpdated});
    this.props.onModifyGallerySettings(updated);
  }

  onChooseAllColumns = () => {
    const { settings } = this.props;
    let itemUpdated = {};
    let filteredColumns = this.getFilteredColumns();
    filteredColumns.forEach(column => {
      itemUpdated[column.name] = true;
    })
    let updated = Object.assign({}, settings, {is_show_row_item: itemUpdated});
    this.props.onModifyGallerySettings(updated);
  }

  getFilteredColumns = () => {
    let { currentColumns } = this.props;
    let filteredColumns = [];
    currentColumns.forEach(column => {
      if (column.key !== '0000') {
        filteredColumns.push(column);
      }
    });

    return filteredColumns;
  }

  getTitleColumns = () => {
    let { currentColumns } = this.props;
    let titleColumns = [];
    currentColumns.forEach(column => {
      if (SHOW_TITLE_SELECT.includes(column.type)) {
        titleColumns.push(column);
      }
    });
    return titleColumns;
  }

  onModifyFieldsSettings = (selectedOption) => {
    let { settings } = this.props;
    let { value, setting_key } = selectedOption;
    let updated = Object.assign({}, settings, {[setting_key]: value});
    this.props.onModifyGallerySettings(updated);
  }

  renderFieldsSelector = (source, settingKey, valueKey, labelKey) => {
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
    return <PluginSelect
      value={selectedOption}
      options={options}
      onChange={this.onModifyFieldsSettings}
    />
  }

  render() {
    let { tables, views, onHideGallerySetting, settings, imageColumns } = this.props;
    let filteredColumns = this.getFilteredColumns();
    let titleColumns = this.getTitleColumns();
    return (
      <div className="plugin-gallery-setting position-absolute" style={{zIndex: zIndexes.GALLERY_SETTING}} ref={ref => this.GallerySetting = ref}>
        <div className="setting-container">
          <div className="setting-header-container d-flex">
            <div className="setting-header-title">{intl.get('Settings')}</div>
            <div className="dtable-font dtable-icon-x btn-close" onClick={onHideGallerySetting}></div>
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
              {imageColumns && imageColumns.length > 0 &&
                <div className="setting-item image-setting">
                  <div className="title">{intl.get('Image_fields')}</div>
                  {this.renderFieldsSelector(imageColumns, 'is_show_row_image', 'name', 'name')}
                </div>
              }
              <div className="setting-item image-setting">
                <div className="title">{intl.get('Title_fields')}</div>
                {this.renderFieldsSelector(titleColumns, 'is_show_row_title', 'name', 'name')}
              </div>
              <div className="setting-item fields-setting">
                <div className="fields-setting-header">
                  <span>{intl.get('Other_fields')}</span>
                  <span className="setting-choose-all" onClick={this.onChooseAllColumns}>{intl.get('Choose_all')}</span>
                </div>
                <div className="fields-setting-body">
                    {filteredColumns.map((column, index) => {
                      return (
                        <GallerySettingItem 
                          key={`gallery-setting-item${index}`}
                          column={column}
                          onColumnItemClick={this.onColumnItemClick}
                          settings={settings}
                        />
                      );
                    })}
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