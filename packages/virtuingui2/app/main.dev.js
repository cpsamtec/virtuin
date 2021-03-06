/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import * as Sentry from '@sentry/electron';


import os from 'os';
import path from 'path';
import fs from 'fs';

import TaskDelegator from './server/taskDelegator';
import { addNotification } from './redux/Notifier';

require('dotenv').config();
const remote = require('electron').remote

import MenuBuilder from './menu';

// create instance of Sentry for debugging production main process
if (process.env.NODE_ENV === 'production' && typeof process.env.VIRT_SENTRY_KEY
    === 'string' && typeof process.env.VIRT_SENTRY_PROJECT === 'string') {
  Sentry.init({
    dsn: `https://${process.env.VIRT_SENTRY_KEY}@sentry.io/${process.env.VIRT_SENTRY_PROJECT}`,
    // ...
  });
}

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};


// ensure process has only one instance
const appLock = app.requestSingleInstanceLock();
if (!appLock) {
  app.quit();
}

// start task delegator
const stationName = process.env.VIRT_STATION_NAME || 'VIRT_DEFAULT_STATION';
//const collectionDefPath = (process.env.NODE_ENV === 'production') ? process.argv[1] : process.env.VIRTUIN_COLLECTION_LOCATION;
//console.log(`ARG 1 IS ${process.argv[1]}`);
const collectionDefPath = process.env.VIRTUIN_COLLECTION_LOCATION;
const appDataPath = app.getPath('appData');

const stackPath = path.join(app.getPath('appData'), 'virtuin');
if (!fs.existsSync(stackPath)){
  fs.mkdirSync(stackPath);
}

// if collection definition provided then do a full initialization
if (collectionDefPath) {
  TaskDelegator.init(stationName, collectionDefPath, stackPath);
  TaskDelegator.up();
} else {
  // otherwise just give station name and stack path
  TaskDelegator.partialInit(stationName, stackPath);
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  //if (process.platform !== 'darwin') {
    TaskDelegator.stop().then(() =>
      {
        app.quit();
      }).catch(e => {
        app.quit();
      })
  //}
});

['SIGINT', 'SIGTERM', 'SIGQUIT']
  .forEach(signal => process.on(signal, () => {
    /** do your logic */
    TaskDelegator.stop().then(() =>
      {
        app.quit();
      }).catch(e => {
        app.quit();
      })
  }));

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 800,
    minHeight: 450,
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('close', (e) => {
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
});
