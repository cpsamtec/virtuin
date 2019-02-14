
//import type { RootInterface, CollectionEnvs } from 'virtuintaskdispatcher/distribution/types';
//import type { DispatchUpdatePrimaryStatus, DispatchStatus } from 'virtuintaskdispatcher';

import { ipcChannels } from '../sagas';
import { VirtuinSagaResponseActions } from '../redux/Virtuin';
import { throws } from 'assert';

const { VirtuinTaskDispatcher } = require('virtuintaskdispatcher').VirtuinTaskDispatcher;
const {ipcMain} = require('electron');

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
    await this.dispatcher.removeAllListeners();
    this.dispatcher = null;
    this.init(this.stationName, collectionDefPath, this.stackPath);
    await this.connect();
    await this.up();
  }
  connect = async () => {
    this.dispatcher.on('task-status', status => {
      this.client.send(ipcChannels.response, VirtuinSagaResponseActions.taskStatusResponse(status));
    });
    console.log(this.dispatcher.getStatus());
    this.client.send(ipcChannels.response, VirtuinSagaResponseActions.taskStatusResponse(this.dispatcher.getStatus()))
  }
  up = async () => {
    await this.dispatcher.up(false, (this.dispatcher.collectionDef.build === 'development'));
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