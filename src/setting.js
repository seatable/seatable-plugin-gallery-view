
const config = {
  APIToken: "dff4d16acdfe3042c25e5e52ea60c9831c79bf02",
  server: "https://dev.seafile.com/dtable-web",
  workspaceID: "4",
  dtableName: "test2",
  lang: "en"
};

const dtablePluginConfig = Object.assign({}, config, {server: config.server.replace(/\/+$/, "")});
window.dtablePluginConfig = dtablePluginConfig;