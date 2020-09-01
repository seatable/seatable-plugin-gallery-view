import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import DTable from 'dtable-sdk';
import './locale/index.js';
import GalleryViewsTabs from './components/gallery-views-tabs';
import { PLUGIN_NAME, SETTING_KEY } from './constants';
import View from './model/view';
import { generatorViewId } from './utils/utils';
import GallerySetting from './components/gallery-setting';
import Gallery from './gallery';
import { GALLERY_DIALOG_MODAL } from './constants/zIndexes';

import './css/plugin-layout.css';
import cardLogo from './assets/image/card-view.png';

const DEFAULT_PLUGIN_SETTINGS = {
  views: [
    {
      _id: '0000',
      name: 'Default View',
      settings: {}
    }
  ]
};

const KEY_SELECTED_VIEW_IDS = `${PLUGIN_NAME}-selectedViewIds`;

const propTypes = {
  showDialog: PropTypes.bool
};

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showDialog: props.showDialog || false,
      table: null,
      itemShowRowLength: 50,
      selectedViewIdx: 0,
      plugin_settings: {},
      isShowGallerySetting: false,
    };
    this.dtable = new DTable();
  }

  componentDidMount() {
    this.initPluginDTableData();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({showDialog: nextProps.showDialog});
  } 

  async initPluginDTableData() {
    if (window.app === undefined) {
      // local develop
      window.app = {};
      await this.dtable.init(window.dtablePluginConfig);
      await this.dtable.syncWithServer();
      let relatedUsersRes = await this.getRelatedUsersFromServer(this.dtable.dtableStore);
      window.app.collaborators = relatedUsersRes.data.user_list;
      this.dtable.subscribe('dtable-connect', () => { this.onDTableConnect(); });
    } else { 
      // integrated to dtable app
      this.dtable.initInBrowser(window.app.dtableStore);
    }
    let table = this.dtable.getActiveTable();
    this.setState({table})
    this.dtable.subscribe('local-dtable-changed', () => { this.onDTableChanged(); });
    this.dtable.subscribe('remote-dtable-changed', () => { this.onDTableChanged(); });
    this.resetData(true);
  }

  async getRelatedUsersFromServer(dtableStore) {
    return dtableStore.dtableAPI.getTableRelatedUsers();
  }

  getRelatedUsersFromLocal = () => {
    let { collaborators, state } = window.app;
    if (!collaborators) {
      // dtable app
      return state && state.collaborators;
    }
    return collaborators; // local develop
  }

  onDTableConnect = () => {
    this.resetData();
  }

  onDTableChanged = () => {
    this.resetData();
  }

  resetData = (init = false) => {
    let { showDialog, isShowGallerySetting } = this.state;
    let plugin_settings = this.dtable.getPluginSettings(PLUGIN_NAME) || {};
    if (!plugin_settings || Object.keys(plugin_settings).length === 0) {
      plugin_settings = DEFAULT_PLUGIN_SETTINGS;
    }
    let { views } = plugin_settings;
    let dtableUuid = this.getDtableUuid();
    let selectedViewIds = this.getSelectedViewIds(KEY_SELECTED_VIEW_IDS) || {};
    let selectedViewId = selectedViewIds[dtableUuid];
    let selectedViewIdx = views.findIndex(v => v._id === selectedViewId);
    selectedViewIdx = selectedViewIdx > 0 ? selectedViewIdx : 0;
    if (init) {
      isShowGallerySetting = !this.isValidViewSettings(views[selectedViewIdx].settings);
      showDialog = true;
    }
    this.setState({
      isLoading: false,
      showDialog,
      plugin_settings,
      selectedViewIdx,
      isShowGallerySetting
    });
  }

  onGallerySettingToggle = () => {
    this.setState({isShowGallerySetting: !this.state.isShowGallerySetting});
  }

  onHideGallerySetting = () => {
    this.setState({isShowGallerySetting: false});
  }

  getDtableUuid = () => {
    if (window.dtable) {
      return window.dtable.dtableUuid;
    }
    return window.dtablePluginConfig.dtableUuid;
  }

  getMediaUrl = () => {
    if (window.dtable) {
      return window.dtable.mediaUrl;
    }
    return window.dtablePluginConfig.mediaUrl;
  }

  onPluginToggle = () => {
    this.setState({showDialog: false});
    window.app.onClosePlugin();
  }

  onSelectView = (viewId) => {
    let { plugin_settings } = this.state;
    let { views: updatedViews } = plugin_settings;
    let viewIdx = updatedViews.findIndex(v => v._id === viewId);
    if (viewIdx > -1) {
      let { settings } = updatedViews[viewIdx];
      let isShowGallerySetting = !this.isValidViewSettings(settings);
      this.setState({selectedViewIdx: viewIdx, isShowGallerySetting, itemShowRowLength: 50});
      this.storeSelectedViewId(viewId);
    }
  }

  initGallerySetting = (settings = {}) => {
    let initUpdated = {};
    let tables = this.dtable.getTables();
    let selectedTable = this.getSelectedTable(tables, settings);
    let titleColumn = selectedTable.columns.find(column => column.key === '0000');
    let imageColumn = selectedTable.columns.find(column => column.type === 'image');
    let imageName = imageColumn ? imageColumn.name : null;
    initUpdated = Object.assign({}, {shown_image_name: imageName}, {shown_title_name: titleColumn.name});
    return initUpdated;
  }

  onAddView = (viewName) => {
    let { plugin_settings } = this.state;
    let { views: updatedViews } = plugin_settings;
    let selectedViewIdx = updatedViews.length;
    let _id = generatorViewId(updatedViews);
    let newView = new View({_id, name: viewName});
    updatedViews.push(newView);
    let { settings } = updatedViews[selectedViewIdx];
    let isShowGallerySetting = !this.isValidViewSettings(settings);
    let initUpdated = this.initGallerySetting();
    updatedViews[selectedViewIdx].settings  = Object.assign({}, initUpdated);
    plugin_settings.views = updatedViews;
    this.setState({
      plugin_settings,
      selectedViewIdx,
      isShowGallerySetting
    }, () => {
      this.storeSelectedViewId(updatedViews[selectedViewIdx]._id);
      this.dtable.updatePluginSettings(PLUGIN_NAME, plugin_settings);
      this.viewsTabs && this.viewsTabs.setGalleryViewsTabsScroll();
    });
  }

  onRenameView = (viewName) => {
    let { plugin_settings, selectedViewIdx } = this.state;
    let updatedView = plugin_settings.views[selectedViewIdx];
    updatedView = Object.assign({}, updatedView, {name: viewName});
    plugin_settings.views[selectedViewIdx] = updatedView;
    this.setState({
      plugin_settings
    }, () => {
      this.dtable.updatePluginSettings(PLUGIN_NAME, plugin_settings);
    });
  }

  onDeleteView = (viewId) => {
    let { plugin_settings, selectedViewIdx } = this.state;
    let { views: updatedViews } = plugin_settings;
    let viewIdx = updatedViews.findIndex(v => v._id === viewId);
    selectedViewIdx = updatedViews.length - 1 === viewIdx ? viewIdx - 1 : selectedViewIdx;
    if (viewIdx > -1) {
      updatedViews.splice(viewIdx, 1);
      let { settings } = updatedViews[selectedViewIdx];
      let isShowGallerySetting = !this.isValidViewSettings(settings);
      plugin_settings.views = updatedViews;
      this.setState({
        plugin_settings,
        selectedViewIdx,
        isShowGallerySetting
      }, () => {
        this.storeSelectedViewId(updatedViews[selectedViewIdx]._id);
        this.dtable.updatePluginSettings(PLUGIN_NAME, plugin_settings);
      });
    }
  }

  onModifyGallerySettings = (updated, type) => {
    let { plugin_settings, selectedViewIdx } = this.state;
    let { views: updatedViews } = plugin_settings;
    let updatedView = plugin_settings.views[selectedViewIdx];
    let { settings: updatedSettings} = updatedView || {};
    if (!type) {
      updatedSettings = Object.assign({}, updatedSettings, updated);
    } else {
      const initUpdated = this.initGallerySetting(updated)
      updatedSettings = Object.assign({}, updated, initUpdated);
    }
    updatedView.settings = updatedSettings;
    updatedViews[selectedViewIdx] = updatedView;
    plugin_settings.views = updatedViews;
    this.setState({plugin_settings}, () => {
      this.dtable.updatePluginSettings(PLUGIN_NAME, plugin_settings);
    });
  }

  onInsertRow = (table, view, rowData) => {
    let columns = this.dtable.getColumns(table);
    let newRowData = {};
    for (let key in rowData) {
      let column = columns.find(column => column.key === key);
      switch(column.type) {
        case 'single-select': {
          let singleSelectName = '';
          singleSelectName = column.data.options.find(item => item.id === rowData[key]);
          newRowData[column.name] = singleSelectName.name;
          break;
        }
        case 'multiple-select': {
          let multipleSelectNameList = [];
          rowData[key].forEach(multiItemId => {
            let multiSelectItemName = column.data.options.find(multiItem => multiItem.id === multiItemId);
            if (multiSelectItemName) {
              multipleSelectNameList.push(multiSelectItemName.name);
            }
          });
          newRowData[column.name] = multipleSelectNameList;

          break;
        }
        default: 
          newRowData[column.name] = rowData[key];
      }
    }
    let row_data = Object.assign({}, newRowData);

    this.dtable.appendRow(table, row_data, view);
    let viewRows = this.dtable.getViewRows(view, table);
    let insertedRow = viewRows[viewRows.length - 1];
    if (insertedRow) {
      if (window.app && window.app.expandRow) {
        window.app.expandRow(insertedRow, table);
      }
    }
  }

  getSelectedTable = (tables, settings = {}) => {
    let selectedTable = this.dtable.getTableByName(settings[SETTING_KEY.TABLE_NAME]);
    if (!selectedTable) {
      return tables[0];
    }
    return selectedTable;
  }

  getSelectedView = (table, settings = {}) => {
    return this.dtable.getViewByName(table, settings[SETTING_KEY.VIEW_NAME]);
  }

  getViews = (table) => {
    let { name } = table || {};
    return this.dtable.getTableViews(name);
  }

  getRows = (tableName, viewName, settings = {}) => {
    let rows = [];
    this.dtable.forEachRow(tableName, viewName, (row) => {
      rows.push(row)
    });
    return rows;
  }

  getRow = (table, rowID) => {
    return this.dtable.getRowById(table, rowID);
  }

  getInsertedRowInitData = (view, table, rowID) => {
    return this.dtable.getInsertedRowInitData(view, table, rowID);
  }

  getLinkCellValue = (linkId, table1Id, table2Id, rowId) => {
    return this.dtable.getLinkCellValue(linkId, table1Id, table2Id, rowId);
  }

  getRowsByID = (tableId, rowIds) => {
    return this.dtable.getRowsByID(tableId, rowIds);
  }

  getTableById = (table_id) => {
    return this.dtable.getTableById(table_id);
  }

  getUserCommonInfo = (email, avatar_size) => {
    if (window.dtableWebAPI) {
      return window.dtableWebAPI.getUserCommonInfo(email, avatar_size);
    }
    return Promise.reject();
  }

  storeSelectedViewId = (viewId) => {
    let dtableUuid = this.getDtableUuid();
    let selectedViewIds = this.getSelectedViewIds(KEY_SELECTED_VIEW_IDS);
    selectedViewIds[dtableUuid] = viewId;
    window.localStorage.setItem(KEY_SELECTED_VIEW_IDS, JSON.stringify(selectedViewIds));
  }

  getSelectedViewIds = (key) => {
    let selectedViewIds = window.localStorage.getItem(key);
    return selectedViewIds ? JSON.parse(selectedViewIds) : {};
  }

  isValidViewSettings = (settings) => {
    return settings && Object.keys(settings).length > 0;
  }

  renderBtnGroups = () => {
    return (
      <div className="gallery-header-btn d-flex align-items-center">
        <span className="btn-close gallery-setting" onClick={this.onGallerySettingToggle}>
          <i className="dtable-font dtable-icon-settings"></i>
        </span>
        <span className="dtable-font dtable-icon-x btn-close" onClick={this.onPluginToggle}></span>
      </div>
    );
  }

  onAddGalleryRowList = () => {
    let newGalleryRowList = this.state.itemShowRowLength + 50;
    this.setState({itemShowRowLength: newGalleryRowList});
  }

  onAddGalleryItem = (view, table, rowID) => {
   let rowData = this.getInsertedRowInitData(view, table, rowID);
   this.onInsertRow(table, view, rowData);
  }

  render() {
    let { isLoading, showDialog, plugin_settings, selectedViewIdx, isShowGallerySetting,
      itemShowRowLength } = this.state;
    if (isLoading) {
      return '';
    }
    let CellType = this.dtable.getCellType();
    let { views: galleryViews } = plugin_settings;
    let selectedGalleryView = galleryViews[selectedViewIdx];
    let { settings } = selectedGalleryView || {};
    let tables = this.dtable.getTables();
    let selectedTable = this.getSelectedTable(tables, settings);
    let { name: tableName, columns: currentColumns } = selectedTable || {};
    let views = this.dtable.getViews(selectedTable);
    let selectedView = this.getSelectedView(selectedTable, settings) || views[0];   
    let { name: viewName } = selectedView;
    let imageColumns = this.dtable.getColumnsByType(selectedTable, CellType.IMAGE);
    let rows = this.getRows(tableName, viewName, settings);
    let isShowAllRowList = false;
    let rowsList = [];
    let collaborators = this.getRelatedUsersFromLocal();
    if (rows.length < itemShowRowLength) {
      rowsList = rows;
      isShowAllRowList = true;
    } else {
      rowsList = rows.filter((item, index) => {
        return index < itemShowRowLength;
      });
    }
    return (
      <Modal isOpen={showDialog} toggle={this.onPluginToggle} className="dtable-plugin plugin-container" contentClassName="gallery-view-content" zIndex={GALLERY_DIALOG_MODAL} size="lg">
        <ModalHeader className="plugin-header" close={this.renderBtnGroups()}>
          <div className="logo-title d-flex align-items-center">
            <img className="plugin-logo" src={cardLogo} alt="" />
            <span className="plugin-title">{'Gallery'}</span>
          </div>
          <GalleryViewsTabs
            ref={ref => this.viewsTabs = ref}
            views={galleryViews}
            onSelectView={this.onSelectView}
            selectedViewIdx={selectedViewIdx}
            onAddView={this.onAddView}
            onDeleteView={this.onDeleteView}
            onRenameView={this.onRenameView}
          />
        </ModalHeader>
        <ModalBody className="test-plugin-content gallery-dialog-body">
          <Gallery
            rows={rowsList}
            selectedGalleryView={selectedGalleryView}
            table={selectedTable}
            imageColumns={imageColumns}
            getRow={this.getRow}
            selectedView={selectedView}
            getInsertedRowInitData={this.getInsertedRowInitData}
            onInsertRow={this.onInsertRow}
            isShowAllRowList={isShowAllRowList}
            onAddGalleryRowList={this.onAddGalleryRowList}
            getRowCommentCount={this.getRowCommentCount}
            onAddGalleryItem={this.onAddGalleryItem}
            settings={settings || {}}
            currentColumns={currentColumns}
            getLinkCellValue={this.getLinkCellValue}
            getRowsByID={this.getRowsByID}
            getTableById={this.getTableById}
            collaborators={collaborators}
            getUserCommonInfo={this.getUserCommonInfo}
            getMediaUrl={this.getMediaUrl}
            CellType={CellType}
          />
          {isShowGallerySetting &&
            <GallerySetting
              tables={tables}
              selectedTable={selectedTable}
              views={views}
              settings={settings || {}}
              onModifyGallerySettings={this.onModifyGallerySettings}
              onHideGallerySetting={this.onHideGallerySetting}
              currentColumns={currentColumns}
              imageColumns={imageColumns}
            />
          }
        </ModalBody>
      </Modal>
    );
  }
}

App.propTypes = propTypes;

export default App;