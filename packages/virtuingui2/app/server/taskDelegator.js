
import type { RootInterface, CollectionEnvs } from 'virtuintaskdispatcher/distribution/types';
import type { DispatchUpdatePrimaryStatus, DispatchStatus } from 'virtuintaskdispatcher';

import { ipcChannels } from '../sagas';
import { VirtuinSagaResponseActions } from '../redux/Virtuin';

const { VirtuinTaskDispatcher } = require('virtuintaskdispatcher').VirtuinTaskDispatcher;

const {ipcMain} = require('electron');

class TaskDelegator {
  dispatcher: VirtuinTaskDispatcher;

  actionHandlers = {
    'CONNECT': this.connect,
    'UP': this.up,
    'RUN': this.run,
    'DOWN': this.down
  }
  init(stationName, collectionDefPath, stackPath, verbosity = 0) {
    // get collection and environment variables for the dispatcher
    try {
      const collectionDef = VirtuinTaskDispatcher.collectionObjectFromPath((collectionDefPath));
      const collectionEnvs = VirtuinTaskDispatcher.collectionEnvFromPath(collectionEnvPath);
    } catch (error) {
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
  connect(client) {
    this.dispatcher.on('task-status', status => {
      client.send(ipcChannels.response, status);
    });
  }
  async up(client, { reloadCompose: boolean = false }) {
    await this.dispatcher.up(reloadCompose, (this.dispatcher.collectionDef.build === 'development'));
    client.send(ipcChannels.response, VirtuinSagaResponseActions.upResponse());
  }
  async run(client, { groupIndex, taskIndex }) {
    try {
      const task = this.dispatcher.collectionDef.taskGroups[groupIndex].tasks[taskIndex];
    } catch (err) {
      throw new Error('[VIRT] Task invalid group/task index')
    }
    await this.dispatcher.startTask({ groupIndex, taskIndex });
    client.send(ipcChannels.response, VirtuinSagaResponseActions.runResponse(groupIndex, taskIndex, 'GOOD'))
  }
  async down(client) {
    await this.dispatcher.down();
    client.send(ipcChannels.response, VirtuinSagaResponseActions.downResponse());
  }
  /**
   * Handles incoming action by mapping w/ actionHandlers and provides back a response
   * @param {*} event 
   * @param {*} arg 
   */
  async handleAction(event, arg) {
    try {
      await actionHandlers[arg.type](event.sender, arg.payload);
    } catch(err) {
      console.log(err);
    }
  }
}

const TaskDelegatorSingleton = TaskDelegator();
export default TaskDelegatorSingleton;