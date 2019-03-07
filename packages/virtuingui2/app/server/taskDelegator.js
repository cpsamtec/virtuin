//@flow
import { ipcMain, dialog } from 'electron';
import prompt from 'electron-prompt';
import { throws } from 'assert';
import { ipcChannels } from '../sagas';
import { VirtuinSagaResponseActions } from '../redux/Virtuin';
import type { RootInterface, CollectionEnvs } from 'virtuintaskdispatcher/distribution/types';

const { VirtuinTaskDispatcher } = require('virtuintaskdispatcher').VirtuinTaskDispatcher;

class TaskDelegator {
  collectionDefPath: string
  stationName: string
  stackPath: string
  dispatcher = null;
  isLoaded = false;
  constructor() {
    this.actionHandlers = {
      'CONNECT': this.connect,
      'SEND_DATA': this.sendData,
      'UP': this.up,
      'RUN': this.run,
      'DOWN': this.down,
    }
  }

  init = (stationName: string, collectionDefPath: string, stackPath: string, verbosity: number = 0) => {
    debugger;
    // get collection and environment variables for the dispatcher

    const tmpCollectionDef: ?RootInterface = VirtuinTaskDispatcher.collectionObjectFromPath((collectionDefPath: any));
    if (!tmpCollectionDef) {
      //Nathan this should create some sort of alert
      console.error('Could not open the collection file');
      return;
    }
    let collectionEnvPath = null;
    if (!tmpCollectionDef || !tmpCollectionDef.stationCollectionEnvPaths
      || !tmpCollectionDef.stationCollectionEnvPaths[stationName]) {
      console.log('The variable stationCollectionEnvPaths is not set for this station in the collection.');
      console.log(`You may want to add ${stationName} key with the full path to the .env of this collection`);
    } else {
      const collectionDef: RootInterface = (tmpCollectionDef: any);
      collectionEnvPath = collectionDef.stationCollectionEnvPaths[stationName];
    }
    const collectionDef: RootInterface = (tmpCollectionDef: any);
    const collectionEnvs: ?CollectionEnvs = VirtuinTaskDispatcher.collectionEnvFromPath(collectionEnvPath);
    //
    this.stationName = stationName;
    this.stackPath = stackPath;
    this.collectionDefPath = collectionDefPath;

    this.dispatcher = new VirtuinTaskDispatcher(
      stationName,
      collectionEnvs,
      collectionDef,
      stackPath,
      verbosity,
      collectionEnvPath
    );
    this.isLoaded = true
    ipcMain.on(ipcChannels.action, this.handleAction);
  }
  paritial_init = (stationName: string, stackPath: string) => {
    this.stationName = stationName;
    this.stackPath = stackPath;
    ipcMain.on(ipcChannels.action, this.handleAction);
  }

  stop = async() => {
    if (this.dispatcher != null) {
      this.dispatcher.removeAllListeners();
      await this.down();
      await this.dispatcher.end();
      this.dispatcher = null;
    }
  }
  reinit = async (collectionDefPath, reload=false) => {
    await this.stop();
    ipcMain.removeListener(ipcChannels.action, this.handleAction);
    this.init(this.stationName, collectionDefPath, this.stackPath);
    await this.connect();
    this.isLoaded = true
    //may need to pass an additional argument to force reload, that will be sent as first argument as dispatcher.up(true)
    await this.up(reload);
  }
  connect = async () => {
    if (this.dispatcher == null) {
      return;
    }
    this.dispatcher.on('task-status', status => {
      this.client.send(ipcChannels.response, VirtuinSagaResponseActions.taskStatusResponse(status));
    });
    this.dispatcher.promptHandler = this.promptHandler;
    this.client.send(ipcChannels.response, VirtuinSagaResponseActions.taskStatusResponse(this.dispatcher.getStatus()))
  }

  promptHandler = async ({promptType, message}): Promise<string> => {
    if (promptType === 'confirmation') {
      return dialog.showMessageBox({type: 'info', buttons: ['okay'], defaultId: 0, message})
    } else if (promptType === 'confirmCancel') {
      return dialog.showMessageBox({type: 'question', buttons: ['cancel', 'okay'], defaultId: 1})
    } else if (promptType === 'text') {
      return prompt({title: message, label: 'Response', inputAttrs: {type: 'text', required: true} });
    } else {
      throw Error(`Unsupported Prompt type`);
    }
  }

  up = async (forceReload=false) => {
    await this.dispatcher.up(forceReload, (this.dispatcher.collectionDef.build === 'development'));
    this.client.send(ipcChannels.response, VirtuinSagaResponseActions.upResponse());
    await this.dispatcher.beginTasksIfAutoStart();
  }
  run = async ({ groupIndex, taskIndex }) => {
    try {
      const task = this.dispatcher.collectionDef.taskGroups[groupIndex].tasks[taskIndex];
    } catch (err) {
      throw new Error('[VIRT] Task invalid group/task index')
    }
    await this.dispatcher.startTask({ groupIndex, taskIndex });
    this.client.send(ipcChannels.response, VirtuinSagaResponseActions.runResponse(groupIndex, taskIndex, 'GOOD'))
  }
  down = async () => {
    await this.dispatcher.down();
    this.isLoaded = false;
    this.client.send(ipcChannels.response, VirtuinSagaResponseActions.downResponse());
  }
  sendData = async ({groupIndex, taskIndex}) => {
    try {
      const task = this.dispatcher.collectionDef.taskGroups[groupIndex].tasks[taskIndex];
    } catch (err) {
      throw new Error('[VIRT] Task invalid group/task index')
    }
    await this.dispatcher.sendTaskInputDataFile({groupIndex, taskIndex});
    this.client.send(ipcChannels.response, VirtuinSagaResponseActions.sendDataResponse(groupIndex, taskIndex, 'GOOD'));
  }
  isCollectionLoaded = () => this.isLoaded;
  /**
   * Handles incoming action by mapping w/ actionHandlers and provides back a response
   * @param {*} event
   * @param {*} arg
   */
  reloadCollection = async () => {
    if (!this.isCollectionLoaded()) return;
    await this.dispatcher.down();
    await this.reinit(this.collectionDefPath, true);
  }
  handleAction = async (event, arg) => {
    try {
      this.client = event.sender;
      await this.actionHandlers[arg.type](arg.payload);

    } catch(err) {
      console.error(err);
    }
  }
}

const TaskDelegatorSingleton = new TaskDelegator();
export default TaskDelegatorSingleton;
