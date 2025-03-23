import React from 'react';
import { createRoot } from 'react-dom/client';
import DTable from 'dtable-sdk';
import './setting';
import App from './app';

class TaskList {

  static async init() {
    const dtableSDK = new DTable();

    // local develop
    await dtableSDK.init(window.dtablePluginConfig);
    await dtableSDK.syncWithServer();

    window.app = {};
    window.app.state = {};
    window.dtable = {
      ...window.dtablePluginConfig,
    };
    window.app.collaborators = dtableSDK.dtableStore.collaborators;
    window.app.state.collaborators = dtableSDK.dtableStore.collaborators;
    window.dtableSDK = dtableSDK;
  }


  static async execute() {
    await this.init();
    const root = createRoot(document.getElementById('root'));
    root.render(<App isDevelopment showDialog />);
  }

}

TaskList.execute();

const openBtn = document.getElementById('plugin-controller');
openBtn.addEventListener('click', function() {
  TaskList.execute();
}, false);
