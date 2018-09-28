/* eslint global-require: 1, flowtype-errors/show-errors: 0 */
/**
 * @flow
 */
import { app, BrowserWindow, dialog } from 'electron';
import MenuBuilder from './menu';
import sharedTaskController from './TaskController';
import { addLogEntry } from '../shared/actions/log';
import { VirtuinTouchBar } from './VirtuinTouchBar';
import logger from './Logger';
import { reconfigureLogger } from './Logger';

import { configureStore } from '../shared/store/configureStore';
const program = require('commander');
const vagrant = require('node-vagrant');
const os = require('os');
const path = require('path');
const fse = require('fs-extra');

let mainWindow = null;
let store :Object;
let virtTouchBar = null;

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line global-require
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  // eslint-disable-next-line global-require
  require('electron-debug')();
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  // eslint-disable-next-line global-require
  require('module').globalPaths.push(p);
}


const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};


/*
const installExtensions = async () => {
  // eslint-disable-next-line global-require
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];
  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};
*/

process.on('uncaughtException', (error) => {
  console.log(`uncaughtException occured: ${error}`);
  try {
    const dialogOptions = {
      type: 'error',
      buttons: ['Exit'],
      title: 'Fatal Error',
      message: `Following uncaugh error occurred: ${error.message}.`
    };
    setTimeout(() => {
      dialog.showMessageBox(mainWindow, dialogOptions);
      app.quit(2);
    }, 500);
  } catch (err) {
    console.log(`uncaughtException occured: ${err.message}`);
  }
});

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
  // MacOS convention: Dont quit if all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  } else if (virtTouchBar != null) {
    virtTouchBar.close();
  }
});

app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 1024,
    minHeight: 728,
    center: true
    // darkTheme: true,
    // scrollBounce: true,
    // webPreferences: {
    //   webSecurity: false
    // },
    // icon: path.join(__dirname, '../../resources/icons/win/icon.ico')
  });

  mainWindow.loadURL(`file://${__dirname}/../renderer/assets/html/app.html`);


  store = configureStore(global.state, 'main', undefined);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.loadCollection = async (collectionPath) => {
    await sharedTaskController.initialize(collectionPath, store);
    /* do not automatically start a task
    setTimeout(() => {
      store.dispatch(fetchTasksRequest(''));
    }, 20);
    setTimeout(() => {
      const state = store.getState();
      const taskId = state.task.tasks[0].id;
      store.dispatch(startTaskRequest(taskId));
    }, 500);
    console.log(`Running task ${taskPath}. Saving results to ${savePath}`);
    */
  };

  mainWindow.loadCollectionDialog = async () => {
    // Prompt for collection path
    const collectionPath = await new Promise(async resolve => {
      try {
        store.dispatch(addLogEntry({ type: 'data', data: '[VIRT] Select collection file.' }));
        const dialogOptions = {
          title: 'Select Collection Definiton',
          filters: [{ name: 'JSON', extensions: ['json', 'JSON', 'yaml', 'yml', 'YAML', 'YML'] }],
          properties: ['openFile'],
          message: 'Please select collection file.',
        };
        dialog.showOpenDialog(mainWindow, dialogOptions, async filepaths => {
          resolve(filepaths && filepaths.length ? filepaths[0] : null);
        });
      } catch (err) {
        resolve(null);
      }
    });
    if (!collectionPath) {
      store.dispatch(addLogEntry({ type: 'data', data: '[VIRT] No collection file selected.' }));
    } else {
      mainWindow.loadCollection(collectionPath);
    }
  };

  mainWindow.loadCredentials = async () => {
    const credentialPath = path.join(app.getPath('userData'), 'virtuin_credentials.json');
    const exists = await fse.pathExists(credentialPath);
    if (exists) {
      store.dispatch(addLogEntry({ type: 'data', data: '[VIRT] Loading credentials.' }));
      //TODO add some checks for credentials
      const credentials = await fse.readJson(credentialPath);
      process.env = {
        ...process.env,
        ...credentials
      };
      await reconfigureLogger();
    }
  };

  mainWindow.uploadCredentials = async () => {
    store.dispatch(addLogEntry({ type: 'data', data: '[VIRT] Uploading credentials.' }));
    const dialogOptions = {
      title: 'Upload Credentials',
      filters: [{ name: 'JSON', extensions: ['json', 'JSON'] }],
      properties: ['openFile'],
      message: 'Please select credential file. Note this will overwrite existing credentials!',
    };
    return new Promise(async resolve => {
      dialog.showOpenDialog(mainWindow, dialogOptions, async filepaths => {
        try {
          if (filepaths == null || filepaths.length === 0) {
            store.dispatch(addLogEntry({ type: 'data', data: '[VIRT] No credential file selected.' }));
            resolve();
            return;
          }
          const basePath = app.getPath('userData');
          const credentialPath = path.join(basePath, 'virtuin_credentials.json');
          const exists = await fse.pathExists(filepaths[0]);
          if (!exists) {
            throw new Error('Credential file doesnt exist or invalid permisions.');
          }
          await fse.copy(filepaths[0], credentialPath, { overwrite: true });
          //await mainWindow.loadCredentials();
          store.dispatch(addLogEntry({
            type: 'data',
            data: '[VIRT] Successfully updated credentials.'
          }));
          resolve();
        } catch (err) {
          store.dispatch(addLogEntry({
            type: 'data',
            data: `[VIRT] Failed updating credentials: ${err.message}`
          }));
          dialog.showMessageBox(mainWindow, {
            type: 'error',
            buttons: ['Dismiss'],
            title: 'Failed Updating Credentials',
            message: err.message
          });
        } finally {
          resolve();
        }
      });
    });
  };

  mainWindow.reloadVM = async () => {
    store.dispatch(addLogEntry({ type: 'data', data: '[VIRT] Restarting Virtuin VM.' }));
    try {
      const succ = await sharedTaskController.reqRestartVM();
      if(succ) {
        store.dispatch(addLogEntry({ type: 'data', data: '[VIRT] Successfully restarted Virtuin VM.' }));
      } else {
        store.dispatch(addLogEntry({ type: 'data', data: '[VIRT] Could not restart Virtuin VM.' }));
      }
    } catch (err) {
      const errMsg = `[VIRT] Failed restarting Virtuin VM with error: ${err.message}`;
      store.dispatch(addLogEntry({ type: 'data', data: `[VIRT] Failed restarting Virtuin VM with error: ${err.message}` }));
      setTimeout(() => {
        const dialogOptions = {
          type: 'error',
          buttons: ['Dismiss'],
          title: 'Command Failed',
          message: errMsg
        };
        dialog.showMessageBox(mainWindow, dialogOptions);
        app.quit(2);
      }, 100);
    }
  };

  mainWindow.webContents.on('did-finish-load', async () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
    // mainWindow.setFullScreen(true);
    // TODO: Use commander. Dont expect task always
    try {
      await mainWindow.loadCredentials();
      // Process program arguments
      const args = [process.argv[0], 'run', ...process.argv.slice(1)];
      program
        .version('0.8.3')
        .option('-c, --collection <path>', 'Directly run given collection')
        .parse(args);
      console.log(args);
      if (program.collection) {
        mainWindow.loadCollection(program.collection);
      }
      if (process.platform === 'darwin') {
        virtTouchBar = new VirtuinTouchBar(store, mainWindow);
        virtTouchBar.initialize();
      }
    } catch (err) {
      const dialogOptions = {
        type: 'error',
        buttons: ['Exit'],
        title: 'Fatal Error',
        message: `Unable to load with the following error: ${err}.`
      };
      setTimeout(() => {
        dialog.showMessageBox(mainWindow, dialogOptions);
        app.quit(2);
      }, 500);
    }
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
