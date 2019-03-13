// @flow
import { ipcMain, dialog } from 'electron';
import prompt from 'electron-prompt';
import { throws } from 'assert';

import { ipcChannels } from '../sagas';

import { VirtuinSagaResponseActions } from '../redux/Virtuin';
import { setCollectionDef } from '../redux/Collection';
import { addNotification } from '../redux/Notifier';

import type { RootInterface, CollectionEnvs } from 'virtuintaskdispatcher/distribution/types';

const { VirtuinTaskDispatcher } = require('virtuintaskdispatcher').VirtuinTaskDispatcher;

/**
 *
 * Delegates actions to the task dispatcher
 * @class TaskDelegator
 */
class TaskDelegator {
  collectionDefPath: string
  collectionDef: ?Object
  stationName: string
  stackPath: string
  actionHandlers: Object
  client: any
  dispatcher: any = null;
  connectActions: Array<Object> = [];
  isLoaded = false;
  
  /**
   * Creates an instance of TaskDelegator.
   * Sets the action handlers to corresponding functions
   * @memberof TaskDelegator
   */
  constructor() {
    this.actionHandlers = {
      'CONNECT': this.connect,
      'SEND_DATA': this.sendData,
      'UP': this.up,
      'RUN': this.run,
      'DOWN': this.down,
      'RESET_GROUP': this.resetGroup,
      'RESET_TASK': this.resetTask
    }
    ipcMain.on(ipcChannels.action, this.handleAction);
  }
  
  /**
   * Initializes the dispatcher
   * @param {string} stationName Name of the station
   * @param {string} collectionDefPath Path to the collection definition
   * @param {string} stackPath Path to the stack location
   * @param {number} [verbosity=0] Verbosity of logs
   * @returns Undefined
   */
  init = (stationName: string, collectionDefPath: string, stackPath: string, verbosity: number = 0) => {
    // these are
    this.connectActions = [];
    // get collection and environment variables for the dispatcher
    const tmpCollectionDef: ?RootInterface = VirtuinTaskDispatcher.collectionObjectFromPath(collectionDefPath);
    if (!tmpCollectionDef) {
      // Unable to connect so send failed
      this.sendAction(addNotification({ 
        message: 'Failed Init: Invalid collection definition provided',
        options: {
          variant: 'error',
        }
      }));
      return;
    }
    let collectionEnvPath = null;
    let collectionEnvPathWarn = false;
    try {
      const collectionDef: RootInterface = (tmpCollectionDef: any);
      collectionEnvPath = collectionDef.stationCollectionEnvPaths[stationName];
      if (!collectionEnvPath) {
        collectionEnvPathWarn = true;
      }
    } catch (error) {
      collectionEnvPathWarn = true;
    }
    if (collectionEnvPathWarn) {
      this.sendAction(addNotification({ 
        message: `The variable stationCollectionEnvPaths is not set for this station in the collection.\n
                  You may want to add ${stationName} key with the full path to the .env of this collection`,
        options: {
          variant: 'warning',
        }
      }));
    }
    const collectionDef: RootInterface = (tmpCollectionDef: any);
    const collectionEnvs: ?CollectionEnvs = VirtuinTaskDispatcher.collectionEnvFromPath(collectionEnvPath);
    // store locally
    this.stationName = stationName;
    this.stackPath = stackPath;
    this.collectionDef = collectionDef;
    this.collectionDefPath = collectionDefPath;

    // create dispatcher
    this.dispatcher = new VirtuinTaskDispatcher(
      stationName,
      collectionEnvs,
      collectionDef,
      stackPath,
      verbosity,
      collectionEnvPath
    );
    // indicate that the collection is loaded
    this.isLoaded = true;

    // indicate that collection is initialized
    this.sendAction(addNotification({ 
      message: `Initialized the Collection`,
      options: {
        variant: 'info',
      }
    }));
    // on task status send response action
    this.dispatcher.on('task-status', status => {
      this.sendAction(VirtuinSagaResponseActions.taskStatusResponse(status));
    });
    // provide a prompt handler to get user input
    this.dispatcher.promptHandler = this.promptHandler;
    // send an initial task status
    this.sendAction(VirtuinSagaResponseActions.taskStatusResponse(this.dispatcher.getStatus()));
    // send collection definition
    this.sendAction(setCollectionDef(this.collectionDef));
  }

  /**
   * Create a partial initialization w/
   * @param {string} stationName Name for the station
   * @param {string} stackPath Path to stack location
   */
  partialInit = (stationName: string, stackPath: string) => {
    this.stationName = stationName;
    this.stackPath = stackPath; 
  }
  
  /**
   * Send connect actions
   */
  connect = async () => {
    if (this.connectActions.length > 0) {
      this.connectActions.forEach((connectAction) => {
        this.client.send(ipcChannels.response, connectAction);
      });
      this.connectActions = []; // clear them as to not be called on reconnection
    } else if (this.dispatcher != null){
      // send an initial task status
      this.sendAction(VirtuinSagaResponseActions.taskStatusResponse(this.dispatcher.getStatus()));
      // send collection definition
      this.sendAction(setCollectionDef(this.collectionDef));
    }
  }

  /**
   * Stops the dispatcher if it is running
   * @returns
   */
  stop = async () => {
    if (!this.isLoaded) {
      return;
    }
    
    this.dispatcher.removeAllListeners();
    await this.down();
    await this.dispatcher.end();
    this.dispatcher = null;
  }

  /**
   * Reinitialize the collection (stop any current running)
   * @param {string} collectionDefPath path of collection to initialize
   * @param {boolean} [reload=false] indicates that it is reloading the collection
   */
  reinit = async (collectionDefPath: string, reload: boolean=false) => {
    try {
      await this.stop();
      this.init(this.stationName, collectionDefPath, this.stackPath);
      await this.connect(); // this is called to resend connecting data
      this.isLoaded = true;
      //may need to pass an additional argument to force reload, that will be sent as first argument as dispatcher.up(true)
      await this.up(reload);
    } catch(err) {
      
      this.sendAction(addNotification({ 
        message: `error upping: ${err}`,
        options: {
          variant: 'error',
          persist: true
        }
      }));
    }
    
  }

  /**
   * Provides a method of obtaining user input for a task
   * @param {{promptType: string, message: string}} { promptType: what type of prompt (confirmation, confirmCancel, text), message: Description of input required }
   * @returns {Promise<string>} user response input
   */
  promptHandler = async ({ promptType, message } : {promptType: string, message: string}): Promise<string> => {
    if (promptType === 'confirmation') {
      return dialog.showMessageBox({type: 'info', buttons: ['okay'], defaultId: 0, message})
    } else if (promptType === 'confirmCancel') {
      return dialog.showMessageBox({type: 'question', buttons: ['cancel', 'okay'], defaultId: 1})
    } else if (promptType === 'text') {
      return prompt({title: message, label: 'Response', inputAttrs: {type: 'text', required: true} });
    } else {
      this.sendAction(addNotification({ 
        message: `PromptHandler: Unsupported Prompt Type`,
        options: {
          variant: 'error',
        }
      }));
    }
  }

  /**
   * Take the docker container and bring it up
   * @param {boolean} [forceReload=false] wether to foce relaod the container
   */
  up = async (forceReload: boolean=false) => {
    await this.dispatcher.up(forceReload, (this.dispatcher.collectionDef.build === 'development'));
    this.sendAction(VirtuinSagaResponseActions.upResponse());
    await this.dispatcher.beginTasksIfAutoStart(); // start any tasks if they are set to autostart
  }

  /**
   * Run a task in a group
   * @param {{groupIndex: number, taskIndex: number}} { groupIndex: group of task, taskIndex: index of task }
   */
  run = async ({ groupIndex, taskIndex } : {groupIndex: number, taskIndex: number}) => {
    try {
      const task = this.dispatcher.collectionDef.taskGroups[groupIndex].tasks[taskIndex];
    } catch (err) {
      this.sendAction(addNotification({ 
        message: 'Failed Run: Invalid group index and/or task index',
        options: {
          variant: 'error',
        }
      }));
      return;
    }
    const response = await this.dispatcher.startTask({ groupIndex, taskIndex });
    this.sendAction(VirtuinSagaResponseActions.runResponse(groupIndex, taskIndex, 'GOOD'))
  }

  /**
   * Take the docker container down
   */
  down = async () => {
    await this.dispatcher.down();
    this.isLoaded = false;
    this.sendAction(VirtuinSagaResponseActions.downResponse());
    this.sendAction(setCollectionDef({}));
  }

  /**
   * Reset task group 
   * @param {{groupIndex: number}} { groupIndex: index of group to reset} 
   */
  resetGroup = async ({ groupIndex } : {groupIndex: number}) => {
    await this.dispatcher.manageGroupTasks(groupIndex, {reset: 'all'});
  }
  /**
   * Reset task
   * @param {{groupIndex: number, taskIndex: number}} { groupIndex: index of task group to reset, taskIndex: index in group }
   */
  resetTask = async ({ groupIndex, taskIndex } : {groupIndex: number, taskIndex: number}) => {
    await this.dispatcher.manageGroupTasks(groupIndex, {reset: [taskIndex]});
  }

  /**
   * Sned data file to task
   * @param {{groupIndex: number, taskIndex: number}} { groupIndex, taskIndex }
   * @returns
   */
  sendData = async ({ groupIndex, taskIndex } : {groupIndex: number, taskIndex: number}) => {
    try {
      const task = this.dispatcher.collectionDef.taskGroups[groupIndex].tasks[taskIndex];
    } catch (err) {
      this.sendAction(addNotification({ 
        message: 'Failed Send Data: Invalid group index and/or task index',
        options: {
          variant: 'error',
        }
      }));
      return;
    }
    await this.dispatcher.sendTaskInputDataFile({groupIndex, taskIndex});
    this.sendAction(VirtuinSagaResponseActions.sendDataResponse(groupIndex, taskIndex, 'GOOD'));
  }
  isCollectionLoaded = () => this.isLoaded;
  /**
   * Handles incoming action by mapping w/ actionHandlers and provides back a response
   * @param {*} event
   * @param {*} arg
   */
  reloadCollection = async () => {
    if (!this.isLoaded) return;
    await this.dispatcher.down();
    await this.reinit(this.collectionDefPath, true);
  }
  
  /**
   * Takes every action dispatched by render saga and calls corresponding handler
   * @param {Object} event
   * @param {Object} arg
   */
  handleAction = async (event: Object, arg: Object) => {
    try {
      this.client = event.sender;
      await this.actionHandlers[arg.type](arg.payload);
    } catch(error) {
      this.sendAction(addNotification({ 
        message: `Failed Handling action: ${arg.type}\n Error: ${error}`,
        options: {
          variant: 'error',
        }
      }));
    }
  }
  
  /**
   * Send action back to client
   * @param {Object} action to be performed
   * @returns
   */
  sendAction = (action: Object) => {
    // if user is not connected, add to list of actions to perform onConnect
    if (this.client == null) {
      this.connectActions.push(action);
      return;
    } 
    // send action
    this.client.send(ipcChannels.response, action);
  }
}

// only allow a single instance of the delegator
const TaskDelegatorSingleton = new TaskDelegator();
export default TaskDelegatorSingleton;
