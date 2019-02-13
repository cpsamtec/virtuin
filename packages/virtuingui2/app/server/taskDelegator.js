
//import type { RootInterface, CollectionEnvs } from 'virtuintaskdispatcher/distribution/types';
//import type { DispatchUpdatePrimaryStatus, DispatchStatus } from 'virtuintaskdispatcher';

import { ipcChannels } from '../sagas';
import { VirtuinSagaResponseActions } from '../redux/Virtuin';

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
      'BEGIN_TASKS_IF_AUTO_START': this.beginTasksIfAutoStart
    }
  }
  init(stationName, collectionDefPath, stackPath, verbosity = 0) {
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
  connect = (client) => {
    console.log('######### client connected ###########')
    this.dispatcher.on('task-status', status => {
      console.log('task-status', status);
      client.send(ipcChannels.response, VirtuinSagaResponseActions.taskStatusResponse(status));
    });
  }
  up = async (client) => {
    console.log('waiting for up to finish');
    await this.dispatcher.up(false, (this.dispatcher.collectionDef.build === 'development'));
    console.log('UP FINISHED');
    client.send(ipcChannels.response, VirtuinSagaResponseActions.upResponse());
  }
  run = async (client, { groupIndex, taskIndex }) => {
    try {
      const task = this.dispatcher.collectionDef.taskGroups[groupIndex].tasks[taskIndex];
    } catch (err) {
      throw new Error('[VIRT] Task invalid group/task index')
    }
    await this.dispatcher.startTask({ groupIndex, taskIndex });
    client.send(ipcChannels.response, VirtuinSagaResponseActions.runResponse(groupIndex, taskIndex, 'GOOD'))
  }
  beginTasksIfAutoStart =  async (client) => {
    await this.dispatcher.beginTasksIfAutoStart();
    client.send(ipcChannels.response, VirtuinSagaResponseActions.beginTasksIfAutoStartResponse());
  }
  down = async (client) => {
    await this.dispatcher.down();
    client.send(ipcChannels.response, VirtuinSagaResponseActions.downResponse());
  }
  sendData = async (client, {groupIndex, taskIndex}) => {
    try {
      const task = this.dispatcher.collectionDef.taskGroups[groupIndex].tasks[taskIndex];
    } catch (err) {
      throw new Error('[VIRT] Task invalid group/task index')
    }
    await dispatcher.sendTaskInputDataFile({groupIndex, taskIndex});
    client.send(ipcChannels.response, VirtuinSagaResponseActions.sendDataResponse(groupIndex, taskIndex, 'GOOD'));
  }
  /**
   * Handles incoming action by mapping w/ actionHandlers and provides back a response
   * @param {*} event 
   * @param {*} arg 
   */
  handleAction = async (event, arg) => {
    try {
      console.log(this.actionHandlers);
      await this.actionHandlers[arg.type](event.sender, arg.payload);
    } catch(err) {
      console.error(err);
    }
  }
}

const TaskDelegatorSingleton = new TaskDelegator();
export default TaskDelegatorSingleton;