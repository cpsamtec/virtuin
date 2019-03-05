import { ipcMain, dialog } from 'electron';
import prompt from 'electron-prompt';
import { throws } from 'assert';
import { ipcChannels } from '../sagas';
import { VirtuinSagaResponseActions } from '../redux/Virtuin';

const { VirtuinTaskDispatcher } = require('virtuintaskdispatcher').VirtuinTaskDispatcher;

class TaskDelegator {
  dispatcher = null;
  constructor() {
    this.actionHandlers = {
      'CONNECT': this.connect,
      'SEND_DATA': this.sendData,
      'UP': this.up,
      'RUN': this.run,
      'DOWN': this.down,
    }
  }

  init = (stationName, collectionDefPath, stackPath, verbosity = 0) => {
    debugger;
    // get collection and environment variables for the dispatcher
    let collectionDef, collectionEnvPath, collectionEnvs;
    try {
      collectionDef = VirtuinTaskDispatcher.collectionObjectFromPath(collectionDefPath);
      collectionEnvPath = collectionDef.stationCollectionEnvPaths[stationName];
      collectionEnvs = VirtuinTaskDispatcher.collectionEnvFromPath(collectionEnvPath);
    } catch (error) {
      console.log(error);
      console.error('Invalid collection def or environment variables provided');
      process.exit(1);
    }
    this.stationName = stationName;
    this.stackPath = stackPath;

    this.dispatcher = new VirtuinTaskDispatcher(
      stationName,
      collectionEnvPath,
      collectionEnvs,
      collectionDef,
      stackPath,
      verbosity,
    );

    ipcMain.on(ipcChannels.action, this.handleAction);
  }
  reinit = async (collectionDefPath) => {
    await this.down();
    await this.dispatcher.end();
    this.dispatcher.removeAllListeners();
    this.dispatcher = null;
    this.init(this.stationName, collectionDefPath, this.stackPath);
    await this.connect();
    //may need to pass an additional argument to force reload, that will be sent as first argument as dispatcher.up(true)
    await this.up();
  }
  connect = async () => {
    this.dispatcher.on('task-status', status => {
      this.client.send(ipcChannels.response, VirtuinSagaResponseActions.taskStatusResponse(status));
    });
    this.dispatcher.promptHandler = this.promptHandler;
    console.log(this.dispatcher.getStatus());
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
    this.client.send(ipcChannels.response, VirtuinSagaResponseActions.downResponse());
  }
  sendData = async ({groupIndex, taskIndex}) => {
    try {
      const task = this.dispatcher.collectionDef.taskGroups[groupIndex].tasks[taskIndex];
    } catch (err) {
      throw new Error('[VIRT] Task invalid group/task index')
    }
    await dispatcher.sendTaskInputDataFile({groupIndex, taskIndex});
    this.client.send(ipcChannels.response, VirtuinSagaResponseActions.sendDataResponse(groupIndex, taskIndex, 'GOOD'));
  }
  /**
   * Handles incoming action by mapping w/ actionHandlers and provides back a response
   * @param {*} event
   * @param {*} arg
   */
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
