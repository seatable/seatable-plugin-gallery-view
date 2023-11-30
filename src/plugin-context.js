class PluginContext {

  getConfig() {
    return window.dtable;
  }

  getSetting(key) {
    return window.dtable[key] || '';
  }

  getInitData() {
    return window.app && window.app.dtableStore;
  }

  expandRow(row, table) {
    window.app && window.app.expandRow(row, table);
  }

  closePlugin() {
    window.app && window.app.onClosePlugin();
  }

  getUserCommonInfo(email, avatar_size) {
    return window.dtableWebAPI.getUserCommonInfo(email, avatar_size);
  }

}

const pluginContext =  new PluginContext();

export default pluginContext;
