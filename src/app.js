import React from 'react';
import PropTypes from 'prop-types';
import DTable from 'dtable-sdk';
import intl from 'react-intl-universal';
import { PLUGIN_NAME, SETTING_KEY } from './constants';
import pluginContext from './plugin-context';
import { generatorViewId, checkDesktop } from './utils/utils';
import ViewsTabs from './components/views-tabs';
import GallerySetting from './components/gallery-setting';
import Gallery from './components/gallery';
import View from './model/view';
import './locale/index.js';

import cardLogo from './assets/image/card-view.png';
import './assets/css/plugin-layout.css';

const DEFAULT_PLUGIN_SETTINGS = {
  views: [
    {
      _id: '0000',
      name: intl.get('Default_View'),
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
      isFitMode: false,
    };
    this.dtable = new DTable();
    this.isDesktop = checkDesktop();
  }

  componentDidMount() {
    this.initPluginDTableData();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({showDialog: nextProps.showDialog});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.showDialog === true && this.state.showDialog === false) {
      this.setState({ itemShowRowLength: 50 });
    }
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
    return pluginContext.getSetting('dtableUuid');
  }

  getMediaUrl = () => {
    return pluginContext.getSetting('mediaUrl');
  }

  onPluginToggle = () => {
    setTimeout(() => {
      this.setState({showDialog: false});
    }, 500);
    pluginContext.closePlugin();
  }

  // move view, update `selectedViewIdx`
  onMoveView = (targetViewID, targetIndexViewID, relativePosition) => {
    let { plugin_settings, selectedViewIdx } = this.state;
    let { views: updatedViews } = plugin_settings;

    let viewIDMap = {};
    updatedViews.forEach((view, index) => {
      viewIDMap[view._id] = view;
    });
    const targetView = viewIDMap[targetViewID];
    const targetIndexView = viewIDMap[targetIndexViewID];
    const selectedView = updatedViews[selectedViewIdx];

    const originalIndex = updatedViews.indexOf(targetView);
    let targetIndex = updatedViews.indexOf(targetIndexView);
    // `relativePosition`: 'before'|'after'
    // eslint-disable-next-line
    targetIndex += relativePosition == 'before' ? 0 : 1;

    if (originalIndex < targetIndex) {
      if (targetIndex < updatedViews.length) {
        updatedViews.splice(targetIndex, 0, targetView);
      } else {
        // drag it to the end
        updatedViews.push(targetView);
      }
      updatedViews.splice(originalIndex, 1);
    } else {
      updatedViews.splice(originalIndex, 1);
      updatedViews.splice(targetIndex, 0, targetView);
    }

    const newSelectedViewIndex = updatedViews.indexOf(selectedView);

    plugin_settings.views = updatedViews;
    this.setState({
      plugin_settings,
      selectedViewIdx: newSelectedViewIndex
    }, () => {
      this.dtable.updatePluginSettings(PLUGIN_NAME, plugin_settings);
    });
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
    let titleName = titleColumn ? titleColumn.name : null;
    initUpdated = Object.assign({}, {shown_image_name: imageName}, {shown_title_name: titleName});
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
      this.viewsTabs && this.viewsTabs.setViewsTabsScroll();
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

  getViewShownColumns = (view, table) => {
    return this.dtable.getViewShownColumns(view, table);
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

  getOptionColors = () => {
    return this.dtable.getOptionColors();
  }

  getTablePermissionType = () => {
    return  this.dtable.getTablePermissionType();
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

  showImageModeToggle = () => {
    const updateFitMode = !this.state.isFitMode;
    this.setState({ isFitMode: updateFitMode });
  }

  render() {
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
    let { name: tableName } = selectedTable || {};
    let views = this.dtable.getNonArchiveViews(selectedTable);
    let selectedView = this.getSelectedView(selectedTable, settings) || views[0];
    let { name: viewName } = selectedView;
    const currentColumns = this.getViewShownColumns(selectedView, selectedTable);
    let imageColumns = currentColumns.filter(field => field.type === CellType.IMAGE);
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
        {this.isDesktop ? (
          <div className="plugin-header">
            <div className="plugin-logo mr-9">
              <img className="mr-2" src={cardLogo} alt="logo" width="24" height="24" />
              <span className="title">{intl.get('Gallery')}</span>
            </div>
            <ViewsTabs
              ref={ref => this.viewsTabs = ref}
              isMobile={false}
              views={galleryViews}
              selectedViewIdx={selectedViewIdx}
              onSelectView={this.onSelectView}
              onAddView={this.onAddView}
              onDeleteView={this.onDeleteView}
              onRenameView={this.onRenameView}
              onMoveView={this.onMoveView}
            />
            <div className="ml-6 align-self-center">
              <span className="dtable-font dtable-icon-set-up mr-1 gallery-op-icon" onClick={this.onGallerySettingToggle}></span>
              <span className="dtable-font dtable-icon-x gallery-op-icon btn-close" onClick={this.onPluginToggle}></span>
            </div>
          </div>) :
          (<React.Fragment>
            <div className="plugin-header justify-content-between">
              <div className="plugin-logo">
                <img className="mr-2" src={cardLogo} alt="logo" width="24" height="24" />
                <span className="title">{'Gallery'}</span>
              </div>
              <div className="ml-2 align-self-center">
                <span className="dtable-font dtable-icon-set-up mr-1 gallery-op-icon" onClick={this.onGallerySettingToggle}></span>
                <span className="dtable-font dtable-icon-x gallery-op-icon btn-close" onClick={this.onPluginToggle}></span>
              </div>
            </div>
            <div className="plugin-header">
              <ViewsTabs
                isMobile
                ref={ref => this.viewsTabs = ref}
                views={galleryViews}
                onSelectView={this.onSelectView}
                selectedViewIdx={selectedViewIdx}
                onAddView={this.onAddView}
                onDeleteView={this.onDeleteView}
                onRenameView={this.onRenameView}
                onMoveView={this.onMoveView}
              />
            </div>
          </React.Fragment>)
        }
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
            getOptionColors={this.getOptionColors}
            collaborators={collaborators}
            getUserCommonInfo={this.getUserCommonInfo}
            getMediaUrl={this.getMediaUrl}
            CellType={CellType}
            formulaRows={formulaRows}
            getTablePermissionType={this.getTablePermissionType}
            getColumnIconConfig={this.getColumnIconConfig}
            isFitMode={this.state.isFitMode}
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
              CellType={CellType}
              getColumnIconConfig={this.getColumnIconConfig}
              isFitMode={this.state.isFitMode}
              onChangeFitMode={this.showImageModeToggle}
            />
          }
        </div>
      </div>
    );
  }
}

App.propTypes = propTypes;

export default App;
