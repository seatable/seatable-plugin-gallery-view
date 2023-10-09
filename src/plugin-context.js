class PluginContext {
  constructor() {
    this.settings = window.dtable ? window.dtable : window.dtablePluginConfig;
    this.api = window.dtableWebAPI ? window.dtableWebAPI : null;
  }

  getConfig() {
    return this.settings;
  }

  getSetting(key) {
    return this.settings[key] || '';
  }

  getInitData() {
    return window.app && window.app.dtableStore;
  }

  expandRow(row, table) {
    window.console.log('window this.api', this.api);
    window.console.log('window this.settings', this.settings);
    window.console.log('window app', window.app);
    window.console.log('window dtable', window.dtable);
    window.console.log('window dtableWebAPI', window.dtableWebAPI);
    window.console.log('window dtablePluginConfig', window.dtablePluginConfig);
    window.console.log('expandRow');
    window.app && window.app.expandRow(row, table);
  }

  closePlugin() {
    window.app && window.app.onClosePlugin();
  }

  getUserCommonInfo(email, avatar_size) {
    if (!this.api) return Promise.reject();
    return this.api.getUserCommonInfo(email, avatar_size);
  }
}

const pluginContext = new PluginContext();

export default pluginContext;
