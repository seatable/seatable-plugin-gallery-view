import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import PluginSelect from './plugin-select';
import { SETTING_KEY, zIndexes } from '../constants';
import '../locale';

import '../css/gallery-setting.css';

const propTypes = {
  tables: PropTypes.array,
  views: PropTypes.array,
  userColumns: PropTypes.array,
  singleSelectColumns: PropTypes.array,
  dateColumns: PropTypes.array,
  settings: PropTypes.object,
  onModifyGallerySettings: PropTypes.func,
  onHideGallerySetting: PropTypes.func,
};

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
    if (setting_key === SETTING_KEY.TABLE_NAME) {
      updated = {[setting_key]: value};  // Need init settings after select new table.
    } else {
      updated = Object.assign({}, settings, {[setting_key]: value});
    }
    this.props.onModifyGallerySettings(updated);
  };

  render() {
    let { tables, views, onHideGallerySetting } = this.props;
    return (
      <div className="plugin-gallery-setting position-absolute" style={{zIndex: zIndexes.GALLERY_SETTING}} ref={ref => this.GallerySetting = ref}>
        <div className="setting-container">
          <div className="setting-header d-flex align-items-center">
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}

GallerySetting.propTypes = propTypes;

export default GallerySetting;