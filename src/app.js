import React from 'react';
import PropTypes from 'prop-types';
import DTable from 'dtable-sdk';
import { PLUGIN_NAME, SETTING_KEY } from './constants';
import pluginContext from './plugin-context';
import { generatorViewId, checkDesktop } from './utils/utils';
import GalleryViewsTabs from './components/gallery-views-tabs';
import View from './model/view';
import GallerySetting from './components/gallery-setting';
import Gallery from './gallery';
import './locale/index.js';

import cardLogo from './assets/image/card-view.png';
import './css/plugin-layout.css';

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
  showDialog: PropTypes.bool,
  isDevelopment: PropTypes.bool,
};
class App extends React.Component {

  static defaultProps = {
    isDevelopment: false
  };

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
    const { isDevelopment } = this.props;
    if (isDevelopment) {
      // local develop
      // todo
      await this.dtable.init(pluginContext.getConfig());
      await this.dtable.syncWithServer();
      this.dtable.subscribe('dtable-connect', () => { this.onDTableConnect(); });
    } else {
      // integrated to dtable app
      const initData = pluginContext.getInitData();
      this.dtable.initInBrowser(initData);
    }
    let table = this.dtable.getActiveTable();
    this.setState({table});
    this.dtable.subscribe('local-dtable-changed', () => { this.onDTableChanged(); });
    this.dtable.subscribe('remote-dtable-changed', () => { this.onDTableChanged(); });
    this.resetData(true);
  }

  getTableRelatedUsers = () => {
    return this.dtable.getRelatedUsers();
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
    pluginContext.getSetting('dtableUuid');
  }

  getMediaUrl = () => {
    pluginContext.getSetting('mediaUrl');
  }

  onPluginToggle = () => {
    setTimeout(() => {
      this.setState({showDialog: false});
    }, 500);
    pluginContext.closePlugin();
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
      const initUpdated = this.initGallerySetting(updated);
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
      if (!column) {
        continue;
      }
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
      pluginContext.expandRow(insertedRow, table);
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
      rows.push(row);
    });
    return rows;
  }

  getRow = (table, rowID) => {
    return this.dtable.getRowById(table, rowID);
  }

  getColumnIconConfig = () => {
    return this.dtable.getColumnIconConfig();
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
    pluginContext.getUserCommonInfo(email, avatar_size);
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

  onAddGalleryRowList = () => {
    let newGalleryRowList = this.state.itemShowRowLength + 50;
    this.setState({itemShowRowLength: newGalleryRowList});
  }

  onAddGalleryItem = (view, table, rowID) => {
    let rowData = this.getInsertedRowInitData(view, table, rowID);
    this.onInsertRow(table, view, rowData);
  }

  getTableFormulaRows = (table, view) => {
    let rows = this.dtable.getViewRows(view, table);
    return this.dtable.getTableFormulaResults(table, rows);
  }

  render() {
    const isDesktop = checkDesktop();
    let { isLoading, showDialog, plugin_settings, selectedViewIdx, isShowGallerySetting, itemShowRowLength } = this.state;
    if (isLoading || !showDialog) {
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
    let collaborators = this.getTableRelatedUsers();
    let formulaRows = this.getTableFormulaRows(selectedTable, selectedView);
    if (rows.length < itemShowRowLength) {
      rowsList = rows;
      isShowAllRowList = true;
    } else {
      rowsList = rows.filter((item, index) => {
        return index < itemShowRowLength;
      });
    }
    return (
      <div className="dtable-plugin gallery-plugin-container w-100">
        {isDesktop ? (
          <div className="plugin-header">
            <div className="plugin-logo mr-9">
              <img className="mr-2" src={cardLogo} alt="logo" width="24" height="24" />
              <span className="title">{'Gallery'}</span>
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
            <div className="ml-6 align-self-center">
              <span className="dtable-font dtable-icon-settings mr-2 gallery-op-icon" onClick={this.onGallerySettingToggle}></span>
              <span className="dtable-font dtable-icon-x gallery-op-icon" onClick={this.onPluginToggle}></span>
            </div>
          </div>) : (
          <React.Fragment>
            <div className="plugin-header justify-content-between">
              <div className="plugin-logo">
                <img className="mr-2" src={cardLogo} alt="logo" width="24" height="24" />
                <span className="title">{'Gallery'}</span>
              </div>
              <div className="ml-2 align-self-center">
                <span className="dtable-font dtable-icon-settings mr-2 gallery-op-icon" onClick={this.onGallerySettingToggle}></span>
                <span className="dtable-font dtable-icon-x gallery-op-icon" onClick={this.onPluginToggle}></span>
              </div>
            </div>
            <div className="plugin-header">
              <GalleryViewsTabs
                ref={ref => this.viewsTabs = ref}
                views={galleryViews}
                onSelectView={this.onSelectView}
                selectedViewIdx={selectedViewIdx}
                onAddView={this.onAddView}
                onDeleteView={this.onDeleteView}
                onRenameView={this.onRenameView}
              />
            </div>
          </React.Fragment>
        )}
        <div className="gallery-content">
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
            tables={tables}
            formulaRows={formulaRows}
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
              getColumnIconConfig={this.getColumnIconConfig}
              CellType={CellType}
            />
          }
        </div>
      </div>
    );
  }
}

App.propTypes = propTypes;

export default App;
