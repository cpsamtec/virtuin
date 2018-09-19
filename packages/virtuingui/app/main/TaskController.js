// @flow
import { app } from 'electron';
import * as path from 'path';
import type { RootInterface, CollectionEnvs } from 'virtuintaskdispatcher/distribution/types';
import { VirtuinTaskDispatcher } from 'virtuintaskdispatcher';
import { setDut } from '../shared/actions/dut';
import { setStation } from '../shared/actions/station';
import { setTaskSpecs } from '../shared/actions/taskSpecs';
import {
  updateActiveTask,
  setActiveTask,
  setActiveTaskState } from '../shared/actions/task';
import { updateTaskStatus } from '../shared/actions/taskStatus';
import { addLogEntry } from '../shared/actions/log';
import logger from './Logger';

import type { RootInterface } from 'virtuintaskdispatcher';

const fse = require('fs-extra');

/**
 * Interface to dispatch tasks to task handler as well as update store
 * from status updates from both task handler and active task.
 */
class TaskController {
  dispatcher: ?VirtuinTaskDispatcher
  isInitialized: boolean
  store: Object
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Reads in target task configs and connects to both task publisher and
   * task handler.
   * @async
   * @param  {string}  filepath Path to active task's configs json filepath.
   * @param  {Object}  store    Redux store of VirtuinCore
   * @return {Promise}          Returns none on sucess or Error on failure
   * @throws {Error}            Throws if fails to connect to RabbitMQ or read configs
   */
  initialize = async (filepath: string, store: object) => {
    try {
      let msg;
      this.store = store;
      const stationName = process.env.VIRT_STATION_NAME;
      // Connect and subscribe to Task Server
      const stackPath = path.join(app.getPath('appData'), 'stacks');
      logger.info(`Task environment configs being saved in ${stackPath}.`);
      await fse.ensureDir(stackPath);
      if(this.dispatcher) {
        this.dispatcher.removeAllListeners();
        this.dispatcher.end();
      }
      const tmpCollectionDef: ?RootInterface = VirtuinTaskDispatcher.collectionObjectFromPath((filepath: any));
      if (!tmpCollectionDef || !tmpCollectionDef.stationCollectionEnvPaths
        || !tmpCollectionDef.stationCollectionEnvPaths[stationName]) {
        console.error('The variable stationCollectionEnvPaths is not set for this station in the collection.');
        throw new Error(`The variable stationCollectionEnvPaths is not set for this station in the collection.
          Please add ${stationName} key with the full path to the .env of this collection`);
      }
      const collectionDef: RootInterface = (tmpCollectionDef: any);
      const collectionEnvPath = collectionDef.stationCollectionEnvPaths[stationName];
      if (!collectionEnvPath) {
        console.error(`The path for the collection path collection.env file was not specified for ${stationName}.`);
        throw new Error(`The path for the collection path collection.env file was not specified for ${stationName}.`);
      }

      const collectionEnvs: ?CollectionEnvs = VirtuinTaskDispatcher.collectionEnvFromPath(collectionEnvPath);
      if (!collectionEnvs) {
        throw new Error(`Could not parse environment variables for collection`);
      }
      this.dispatcher = new VirtuinTaskDispatcher(
        stationName,
        filepath,
        (collectionEnvs: any),
        collectionDef,
        stackPath
      );
      this.setupDispatcherEvents();
      await this.dispatcher.upVM(false);
      await this.dispatcher.login();
      await this.dispatcher.up(false);
      msg = `[VIRT] Subscribing to task status.`;
      logger.info(msg);
      this.store.dispatch(addLogEntry({ type: 'info', data: msg }));
      // Connect and subscribe to Task Publisher
      this.isInitialized = true;
    } catch (err) {
      this.isInitialized = false;
      throw err;
    }
  }

  setupDispatcherEvents = () => {
    this.dispatcher.on('task-status', status => {
      try {
        const msg = JSON.stringify(status, undefined, "  ");
        //logger.info(msg);
        //this.store.dispatch(addLogEntry({ type: 'info', data: msg }));
      } catch(error) {

      }
    });
  }

  /**
   * Handles status updates of active task.
   * @param  {Object} status Task status Object
   * @return {void}
   */
  handleStatusUpdate = (status) => {
    this.store.dispatch(updateTaskStatus(status));
    if (status.state === 'FINISHED') {
      this.handleTaskFinished(status);
    }
  }

  /**
   * Handle when active task finishes (killed or complete).
   * @param  {Object} status Task status object
   * @return {void}
   */
  handleTaskFinished = (status) => {
    this.store.dispatch(setActiveTaskState(status.state));
    if (status.error != null) {
      const errMsg = `[VIRT] Task prematurely quit with error ${status.error}`;
      this.store.dispatch(addLogEntry({ type: 'error', data: errMsg }));
      logger.warn(errMsg);
      setTimeout(async () => {
        try {
          const dispatcherStatus = this.dispatcher.getStatus();
          this.store.dispatch(addLogEntry({ type: 'warn', data: '[VIRT] DETAILS:' }));
          this.store.dispatch(addLogEntry({ type: 'warn', data: `[VIRT] ERROR: ${dispatcherStatus.error || 'N/A'}` }));
          this.store.dispatch(addLogEntry({ type: 'warn', data: `[VIRT] STDOUT: ${this.dispatcher.activeStdOut}` }));
          this.store.dispatch(addLogEntry({ type: 'warn', data: `[VIRT] STDERR: ${this.dispatcher.activeStdErr}` }));
          await this.dispatcher.clearTask();
        } catch (err) {
          const errMsg2 = `[VIRT] Task finished handler received error: ${err.message}`;
          logger.warn(errMsg2);
          this.store.dispatch(addLogEntry({ type: 'warn', data: errMsg2 }));
        }
      }, 500);
    } else {
      const logType = status.passed ? 'success' : 'warn';
      const logResult = status.passed ? 'PASSED' : 'FAILED';
      logger.info(`Task finished with result ${logResult}. Details: ${status.message}.`);
      this.store.dispatch(addLogEntry({
        type: logType,
        data: `[VIRT] Task finished with result ${logResult}. ${status.message}`
      }));
    }
  }

  /**
   * Redux saga action to fetch list of tasks from server
   * TODO: For now simply stores only supplied task
   * @param  {string}  accessToken Credentials to access server
   * @return {Promise}             On success returns list of tasks
   */
  // eslint-disable-next-line no-unused-vars
  reqFetchTasks = async (accessToken) => {
    if (this.collectionConfigs === undefined) {
      return [];
    }
    // TODO: Just use collection's initial task sequence task task
    const task = {
      id: this.taskConfigs.name,
      specs: this.taskConfigs.specs || [],
      conditions: this.taskConfigs.conditions || [],
      ...this.taskConfigs
    };
    return [task];
  }

  /**
   * Redux saga action to start task
   * @param  {string}  id Unique task identifier to start
   * @return {Promise}    On success returns active task UUID otherwise Error object
   * @throws Error
   */
  reqStartTask = async (groupIndex, taskIndex) => {
    try {
      // Kill any existing task that may be running
      const status = this.dispatcher.getStatus();
      if (['IDLE', 'KILLED', 'FINISHED'].find(s => s === status.state) === undefined) {
        this.store.dispatch(addLogEntry({
          type: 'data',
          data: `[VIRT] Existing task already running. Attempting to kill previous task ${status.taskName}.`
        }));
        await this.reqStopTask();
      }
      const group = this.dispatcher.collectionDef.taskGroups[groupIndex] || {};
      const tasks = group.tasks || [];
      const response = null;
      if (taskIndex < 0 || taskIndex >= tasks.length) {
        throw new Error('[VIRT] Task invalid group/task index');
      }
      const currTask = tasks[taskIndex];
      const taskConfigs = {
        currTask,
        groupName: group.name
      };
      this.store.dispatch(addLogEntry({ type: 'data', data: `[VIRT] Attempting to start task ${currTask.name}.` }));
      const response = this.dispatcher.startTask(taskConfigs, (this.dispatcher.collectionDef.build === 'development'));
      if (response.success) {
        logger.info(`Successfully started task ${task.name} with uuid ${response.status.taskUUID} on station ${station.name}.`);
        return { id, taskUUID: response.status.taskUUID, state: 'RUNNING', time: Date.now(), error: undefined, ...task };
      }
      logger.info(`Failed starting task ${task.name} on station ${station.name}.`);
      throw response.error || new Error('Dispatcher responded with unknown error');
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * Redux saga action to stop task.
   * @return {Promise}      On success returns active task object otherwise Error object
   */
  reqStopTask = async () => {
    try {
      this.store.dispatch(addLogEntry({ type: 'data', data: `[VIRT] Attempting to kill active task` }));
      const response = await this.dispatcher.stopTask();
      const { status } = response;
      if (!response.success) {
        throw response.error || new Error('Dispatcher responded with unkown error while stopping task');
      }
      if (status.state === 'KILLED' || status.state === 'FINISHED') {
        return { id, taskUUID: status.taskUUID, state: status.state, error: undefined };
      }
      for (let attempt = 0; attempt < 20; attempt += 1) {
        try {
          this.store.dispatch(addLogEntry({
            type: 'warn',
            data: `[VIRT] Awaiting task to terminate. Attempt ${attempt + 1} of 20.` }));
          // eslint-disable-next-line no-await-in-loop
          const curStatus = await new Promise(async (resolve) => {
            setTimeout(() => {
              const lclStatus = this.dispatcher.getStatus();
              resolve(lclStatus);
            }, 100);
          });
          if (curStatus.state === 'KILLED' || curStatus.state === 'FINISHED') {
            logger.info(`Successfully killed task ${curStatus.taskName} with uuid ${curStatus.taskUUID}.`);
            return { id, taskUUID: curStatus.taskUUID, state: curStatus.state, error: undefined };
          }
        } catch (err) {
          throw err;
        }
      }
      throw new Error('Task server failed to kill task');
    } catch (err) {
      logger.info(`Failed killing task with error ${err.message}.`);
      throw err;
    }
  }
// eslint-disable-next-line import/prefer-default-export
export const sharedTaskController = new TaskController();
