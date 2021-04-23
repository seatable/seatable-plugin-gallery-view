import React from 'react';
import ReactDOM from 'react-dom';
import './setting'; // should init before app component
import App from './app';

class TaskList {

  static execute() {
    ReactDOM.render(<App isDevelopment={true} showDialog={true} />, document.getElementById('root'));
  }

}

TaskList.execute();

const openBtn = document.getElementById('plugin-controller');
openBtn.addEventListener('click', function() {
  TaskList.execute();
}, false);