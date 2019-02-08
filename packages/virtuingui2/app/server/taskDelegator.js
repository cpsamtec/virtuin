
import { ipcChannels } from '../sagas';

import type { RootInterface, CollectionEnvs } from 'virtuintaskdispatcher/distribution/types';
import type { DispatchUpdatePrimaryStatus, DispatchStatus } from 'virtuintaskdispatcher';
const { VirtuinTaskDispatcher } = require('virtuintaskdispatcher').VirtuinTaskDispatcher;

const {ipcMain} = require('electron');

class TaskDelegator {
  dispatcher: VirtuinTaskDispatcher;

  actionHandlers = {
    'UP': this.up,
    'RUN': this.run,
    'DOWN': this.down
  }
  init() {
    //TODO: add arguments to dispatcher
    this.dispatcher = new VirtuinTaskDispatcher();
    ipcMain.on(ipcChannels.action, this.handleAction);
  }
  close() {

  }
  async up({ reloadCompose: boolean = false }) {
    await this.dispatcher.up(reloadCompose, (this.dispatcher.collectionDef.build === 'development'));
  }
  async run() {

  }
  async down() {
    
  }
  /**
   * Handles incoming action by mapping w/ actionHandlers and provides back a response
   * @param {*} event 
   * @param {*} arg 
   */
  async handleAction(event, arg) {
    try {
      const resp = await actionHandlers[arg.type](arg.payload);
      if (resp) event.sender.send(ipcChannels.response, resp);
    } catch(err) {
      console.log(err);
    }
  }
}

const TaskDelegatorSingleton = TaskDelegator();
export default TaskDelegator;