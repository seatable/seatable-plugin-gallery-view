import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import {
  CellType, getTableById, getTableByName, getViewByName, getViewShownColumns, getRowById,
  getRowsByIds, getLinkCellValue, getNonArchiveViews, getNonPrivateViews
} from 'dtable-utils';
import { toaster } from 'dtable-ui-component';
import { Button } from 'reactstrap';
import { PLUGIN_NAME, SETTING_KEY } from './constants';
import pluginContext from './plugin-context';
import { generatorViewId, checkDesktop } from './utils/utils';
import ViewsTabs from './components/views-tabs';
import GallerySetting from './components/gallery-setting';
import Gallery from './components/gallery';
import View from './model/view';
import Icon from './components/icon';
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
    };
    this.isDesktop = checkDesktop();
  }

  componentDidMount() {
    this.initPluginDTableData();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ showDialog: nextProps.showDialog });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.showDialog === true && this.state.showDialog === false) {
      this.setState({ itemShowRowLength: 50 });
    }
  }

  async initPluginDTableData() {
    if (this.props.isDevelopment) {
      // local develop
      window.dtableSDK.subscribe('dtable-connect', () => { this.onDTableConnect(); });
    }
    const table = window.dtableSDK.getActiveTable();
    this.setState({ table });
    window.dtableSDK.subscribe('local-dtable-changed', () => { this.onDTableChanged(); });
    window.dtableSDK.subscribe('remote-dtable-changed', () => { this.onDTableChanged(); });
    this.resetData(true);
  }

  onDTableConnect = () => {
    this.resetData();
  };

  onDTableChanged = () => {
    this.resetData();
  };

  resetData = (init = false) => {
    let { showDialog, isShowGallerySetting } = this.state;
    let plugin_settings = window.dtableSDK.getPluginSettings(PLUGIN_NAME) || {};
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
  };

  onGallerySettingToggle = () => {
    this.setState({ isShowGallerySetting: !this.state.isShowGallerySetting });
  };

  onHideGallerySetting = () => {
    this.setState({ isShowGallerySetting: false });
  };

  getDtableUuid = () => {
    return pluginContext.getSetting('dtableUuid');
  };

  getMediaUrl = () => {
    return pluginContext.getSetting('mediaUrl');
  };

  onPluginToggle = () => {
    setTimeout(() => {
      this.setState({ showDialog: false });
    }, 500);
    pluginContext.closePlugin();
  };

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
      window.dtableSDK.updatePluginSettings(PLUGIN_NAME, plugin_settings);
    });
  };

  onSelectView = (viewId) => {
    let { plugin_settings } = this.state;
    let { views: updatedViews } = plugin_settings;
    let viewIdx = updatedViews.findIndex(v => v._id === viewId);
    if (viewIdx > -1) {
      let { settings } = updatedViews[viewIdx];
      let isShowGallerySetting = !this.isValidViewSettings(settings);
      this.setState({ selectedViewIdx: viewIdx, isShowGallerySetting, itemShowRowLength: 50 });
      this.storeSelectedViewId(viewId);
    }
  };

  initGallerySetting = (settings = {}) => {
    let initUpdated = {};
    let selectedTable = this.getSelectedTable(settings);
    let titleColumn = selectedTable.columns.find(column => column.key === '0000');
    let imageColumn = selectedTable.columns.find(column => column.type === 'image');
    let imageName = imageColumn ? imageColumn.name : null;
    let titleName = titleColumn ? titleColumn.name : null;
    initUpdated = Object.assign({}, { shown_image_name: imageName }, { shown_title_name: titleName });
    return initUpdated;
  };

  onAddView = (viewName) => {
    let { plugin_settings } = this.state;
    let { views: updatedViews } = plugin_settings;
    let selectedViewIdx = updatedViews.length;
    let _id = generatorViewId(updatedViews);
    let newView = new View({ _id, name: viewName });
    updatedViews.push(newView);
    let { settings } = updatedViews[selectedViewIdx];
    let isShowGallerySetting = !this.isValidViewSettings(settings);
    let initUpdated = this.initGallerySetting();
    updatedViews[selectedViewIdx].settings = Object.assign({}, initUpdated);
    plugin_settings.views = updatedViews;
    this.setState({
      plugin_settings,
      selectedViewIdx,
      isShowGallerySetting
    }, () => {
      this.storeSelectedViewId(updatedViews[selectedViewIdx]._id);
      window.dtableSDK.updatePluginSettings(PLUGIN_NAME, plugin_settings);
      this.viewsTabs && this.viewsTabs.setViewsTabsScroll();
    });
  };

  onRenameView = (viewName) => {
    let { plugin_settings, selectedViewIdx } = this.state;
    let updatedView = plugin_settings.views[selectedViewIdx];
    updatedView = Object.assign({}, updatedView, { name: viewName });
    plugin_settings.views[selectedViewIdx] = updatedView;
    this.setState({
      plugin_settings
    }, () => {
      window.dtableSDK.updatePluginSettings(PLUGIN_NAME, plugin_settings);
    });
  };

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
        window.dtableSDK.updatePluginSettings(PLUGIN_NAME, plugin_settings);
      });
    }
  };

  onModifyGallerySettings = (updated, type) => {
    let { plugin_settings, selectedViewIdx } = this.state;
    let { views: updatedViews } = plugin_settings;
    let updatedView = plugin_settings.views[selectedViewIdx];
    let { settings: updatedSettings } = updatedView || {};
    if (!type) {
      updatedSettings = Object.assign({}, updatedSettings, updated);
    } else {
      const initUpdated = this.initGallerySetting(updated);
      updatedSettings = Object.assign({}, updated, initUpdated);
    }
    updatedView.settings = updatedSettings;
    updatedViews[selectedViewIdx] = updatedView;
    plugin_settings.views = updatedViews;
    this.setState({ plugin_settings }, () => {
      window.dtableSDK.updatePluginSettings(PLUGIN_NAME, plugin_settings);
    });
  };

  onInsertRow = (table, view, rowData) => {
    const { columns } = table;
    let newRowData = {};
    for (let key in rowData) {
      let column = columns.find(column => column.key === key);
      if (!column) {
        continue;
      }
      switch (column.type) {
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

    window.dtableSDK.appendRow(table, row_data, view);
    const viewRows = window.dtableSDK.getViewRows(view, table);
    const insertedRow = viewRows[viewRows.length - 1];
    if (insertedRow) {
      pluginContext.expandRow(insertedRow, table);
    }
  };

  getSelectedTable = (settings = {}) => {
    const tables = window.dtableSDK.getTables();
    return getTableByName(tables, settings[SETTING_KEY.TABLE_NAME]) || tables[0];
  };

  getSelectedView = (table, settings = {}) => {
    return getViewByName(table.views, settings[SETTING_KEY.VIEW_NAME]);
  };

  getRows = (tableName, viewName, settings = {}) => {
    let rows = [];
    window.dtableSDK.forEachRow(tableName, viewName, (row) => {
      rows.push(row);
    });
    return rows;
  };

  getRow = (table, rowID) => {
    return getRowById(table, rowID);
  };

  getInsertedRowInitData = (view, table, rowID) => {
    return window.dtableSDK.getInsertedRowInitData(view, table, rowID);
  };

  getLinkCellValue = (linkId, table1Id, table2Id, rowId) => {
    const links = window.dtableSDK.getLinks();
    return getLinkCellValue(links, linkId, table1Id, table2Id, rowId);
  };

  getRowsByID = (tableId, rowIds) => {
    const table = this.getTableById(tableId);
    return getRowsByIds(table, rowIds);
  };

  getTableById = (table_id) => {
    const tables = window.dtableSDK.getTables();
    return getTableById(tables, table_id);
  };

  getUserCommonInfo = (email, avatar_size) => {
    pluginContext.getUserCommonInfo(email, avatar_size);
  };

  storeSelectedViewId = (viewId) => {
    const dtableUuid = this.getDtableUuid();
    const selectedViewIds = this.getSelectedViewIds(KEY_SELECTED_VIEW_IDS);
    selectedViewIds[dtableUuid] = viewId;
    window.localStorage.setItem(KEY_SELECTED_VIEW_IDS, JSON.stringify(selectedViewIds));
  };

  getSelectedViewIds = (key) => {
    const selectedViewIds = window.localStorage.getItem(key);
    return selectedViewIds ? JSON.parse(selectedViewIds) : {};
  };

  isValidViewSettings = (settings) => {
    return settings && Object.keys(settings).length > 0;
  };

  onAddGalleryRowList = () => {
    const newGalleryRowList = this.state.itemShowRowLength + 50;
    this.setState({ itemShowRowLength: newGalleryRowList });
  };

  onAddGalleryItem = (view, table, rowID) => {
    const rowData = this.getInsertedRowInitData(view, table, rowID);
    this.onInsertRow(table, view, rowData);
  };

  getTableFormulaRows = (table, view) => {
    const rows = window.dtableSDK.getViewRows(view, table);
    return window.dtableSDK.getTableFormulaResults(table, rows);
  };

  // Create a unique view name by appending an incremental suffix if needed
  getSuffixedViewName = (viewName, views) => {
    if (!Array.isArray(views) || views.length === 0) return viewName || '';
    const existedViewNames = views.map(v => v.name);
    if (!viewName) viewName = intl.get('Gallery');
    if (existedViewNames.indexOf(viewName) === -1) return viewName;
    const reg = new RegExp(`^${viewName} (\\d+)$`);
    let maxNum = 0;
    existedViewNames.forEach(name => {
      const match = name.match(reg);
      if (match && match[1]) {
        const num = Number(match[1]);
        if (!isNaN(num)) maxNum = Math.max(maxNum, num);
      }
    });
    return `${viewName} ${maxNum + 1}`;
  };

  // Migrate plugin views to gallery views
  migratePluginToView = async () => {
    try {
      const plugin_settings = window.dtableSDK.getPluginSettings(PLUGIN_NAME) || {};
      const { views = [] } = plugin_settings;
      if (!Array.isArray(views) || views.length === 0) return;

      toaster.notify(intl.get('Starting_migration'));
      const tables = window.dtableSDK.getTables();
      for (let i = 0; i < views.length; i++) {
        const view = views[i] || {};
        const {
          name = intl.get('Gallery'),
          settings = {}
        } = view;

        const {
          table_name,
          shown_image_name = '',
          shown_title_name = '',
          shown_column_names = [],
          display_field_name = false,
        } = settings;

        const selectedTable = (table_name && getTableByName(tables, table_name)) || tables[0];
        if (!selectedTable) continue;

        const columns = selectedTable.columns;
        const titleColumn = shown_title_name && columns.find(col => col.name === shown_title_name);
        const imageColumn = shown_image_name && columns.find(col => col.name === shown_image_name);
        const title_column_key = titleColumn ? titleColumn.key : '';
        const image_column_key = imageColumn ? imageColumn.key : '';
        const shownNamesSet = new Set(shown_column_names);
        const card_columns = [];

        shown_column_names.forEach(columnName => {
          const column = columns.find(col => col.name === columnName);
          if (column) {
            card_columns.push({ key: column.key, shown: true });
          }
        });

        columns.forEach(column => {
          if (!shownNamesSet.has(column.name)) {
            card_columns.push({ key: column.key, shown: false });
          }
        });

        const selectTableViews = window.dtableSDK.getViews(selectedTable) || [];
        const viewName = this.getSuffixedViewName(name, selectTableViews);

        const view_Data = {
          type: 'gallery',
          name: viewName,
          custom_settings: {
            image_column_key,
            title_column_key,
            card_columns,
            show_fields_name: !!display_field_name,
          },
        };

        await new Promise((resolve, reject) => {
          try {
            window.dtableSDK.migratePluginView(selectedTable.name, view_Data);
            setTimeout(resolve, 500);
          } catch (error) {
            reject(error);
          }
        });
      }
      toaster.success(intl.get('Migrate_to_views_successfully'));
    } catch (error) {
      toaster.danger(intl.get('Migration_failed'));
    }
  };

  render() {
    const {
      isLoading, showDialog, plugin_settings, selectedViewIdx, isShowGallerySetting,
      itemShowRowLength,
    } = this.state;
    if (isLoading || !showDialog) {
      return '';
    }
    const { views: galleryViews } = plugin_settings;
    const selectedGalleryView = galleryViews[selectedViewIdx];
    const { settings } = selectedGalleryView || {};
    const tables = window.dtableSDK.getTables();
    const selectedTable = this.getSelectedTable(settings);
    const { name: tableName } = selectedTable || {};
    const views = getNonPrivateViews(getNonArchiveViews(selectedTable.views));
    const selectedView = this.getSelectedView(selectedTable, settings) || views[0];
    const { name: viewName } = selectedView;
    const currentColumns = getViewShownColumns(selectedView, selectedTable.columns);
    const imageColumns = currentColumns.filter(field => field.type === CellType.IMAGE);
    const rows = this.getRows(tableName, viewName, settings);
    let isShowAllRowList = false;
    let rowsList = [];
    const collaborators = window.app.state.collaborators;
    const formulaRows = this.getTableFormulaRows(selectedTable, selectedView);
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
            <div className="ml-6 align-self-center d-flex align-items-center">
              {selectedViewIdx > -1 &&
                <Button className="mr-4 migrate-to-view-button" onClick={this.migratePluginToView} color="secondary">
                  <Icon symbol='move-to' className='mr-2' />
                  <span>{intl.get('Migrate_to_view')}</span>
                </Button>
              }
              <span className="dtable-font dtable-icon-set-up mr-1 gallery-op-icon" onClick={this.onGallerySettingToggle}></span>
              <span className="dtable-font dtable-icon-x gallery-op-icon" onClick={this.onPluginToggle}></span>
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
                <span className="dtable-font dtable-icon-x gallery-op-icon" onClick={this.onPluginToggle}></span>
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
            collaborators={collaborators}
            getUserCommonInfo={this.getUserCommonInfo}
            getMediaUrl={this.getMediaUrl}
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
            />
          }
        </div>
      </div>
    );
  }
}

App.propTypes = propTypes;

export default App;
