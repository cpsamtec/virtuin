// @flow
import { app } from 'electron';
import * as path from 'path';
import type { RootInterface, CollectionEnvs } from 'virtuintaskdispatcher/distribution/types';
import { addLogEntry } from '../shared/actions/log';
import { updateDispatchStatus, updateDispatchError } from '../shared/actions/dispatch';
import logger from './Logger';
import os from 'os';

const { VirtuinTaskDispatcher } = require('virtuintaskdispatcher').VirtuinTaskDispatcher;
const fse = require('fs-extra');

/**
 * Interface to dispatch tasks to task handler as well as update store
 * from status updates from both task handler and active task.
 */
class TaskController {
  dispatcher: VirtuinTaskDispatcher | null
  isInitialized: boolean
  store: Object
  constructor() {
    this.isInitialized = false;
    this.dispatcher = null;
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
  initialize = async (filepath: string, store: Object) => {
    try {
      let msg;
      this.store = store;
      const stationName = process.env.VIRT_STATION_NAME;
      if (!stationName) {
        this.store.dispatch(addLogEntry({ type: 'error', data: `The environment variable VIRT_STATION_NAME is not set`}));
        throw new Error(`The environment variable VIRT_STATION_NAME must be set`);
      }
      // Connect and subscribe to Task Server
      //const stackPath = path.join(app.getPath('appData'), 'stacks');
      const stackPath = path.join(os.tmpdir(), 'stacks');
      logger.info(`Task environment configs being saved in ${stackPath}.`);
      await fse.ensureDir(stackPath);
      if(this.dispatcher !== null) {
        this.dispatcher.removeAllListeners();
        //$FlowFixMe
        this.dispatcher.end();
        this.dispatcher = null;
      }
      this.isInitialized = false;
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
        collectionEnvPath,
        (collectionEnvs: any),
        collectionDef,
        stackPath
      );
      this.setupDispatcherEvents();
      this.dispatcher && this.store.dispatch(updateDispatchStatus(this.dispatcher.getStatus()));
      this.dispatcher && await this.dispatcher.upVM(false);
      this.dispatcher && await this.dispatcher.login();
      this.dispatcher && await this.dispatcher.up(false);
      msg = `[VIRT] Finished loading collection`;
      logger.info(msg);
      this.store.dispatch(addLogEntry({ type: 'info', data: msg }));
      // Connect and subscribe to Task Publisher
      this.isInitialized = true;
    } catch (err) {
      this.isInitialized = false;
      if(this.dispatcher) {
        //For now if initialization fails just stop environment
        try {
          this.store.dispatch(addLogEntry({ type: 'info', data: `Could not initialize dispatcher. Shutting what can down` }));
          this.dispatcher && await this.dispatcher.down();
          this.dispatcher && await this.dispatcher.downVM();
        } catch(e) {
          this.store.dispatch(addLogEntry({ type: 'info', data: `Error shutting down: ${e}` }));
        }
        this.dispatcher && this.dispatcher.removeAllListeners();
        this.dispatcher && this.dispatcher.end();
        this.dispatcher = null;
      }
      this.store.dispatch(updateDispatchStatus(VirtuinTaskDispatcher.genInitDispatchStatus()));
      this.store.dispatch(updateDispatchError({message: err.description}));
    }
    if(this.dispatcher) {
      try {
        const {success, error} = await this.dispatcher.beginTasksIfAutoStart(false);
        if(success) {
          this.store.dispatch(addLogEntry({ type: 'info', data: `Successfully ran autoStart tasks` }));
        } else if(error) {
          this.store.dispatch(updateDispatchError({message: `Error beginning autoStart tasks - ${error.description}`}));
        }
      } catch(err) {
        this.store.dispatch(updateDispatchError({message: `Error beginning autoStart tasks - ${err.description}`}));
      }
    }
  }

  setupDispatcherEvents = () => {
    if(!this.dispatcher) {
      return;
    }
    this.dispatcher.on('task-status', status => {
      try {
        setTimeout(() => {
          this.store.dispatch(updateDispatchStatus(status));
          //const msg = JSON.stringify(status, undefined, "  ");
          //this.store.dispatch(addLogEntry({ type: 'info', data: msg }));
        }, 0);
      } catch(error) {

      }
    });
  }


  /**
   * Redux saga action to start task
   * @param  {groupIndex}  id Unique task identifier to start
   * @param  {taskIndex}  id Unique task identifier to start
   * @throws Error
   */
  reqStartTask = async (groupIndex: number, taskIndex: number): Promise<boolean>  => {
    if(this.dispatcher === null) {
      return false;
    }
    try {
      const response: { success: boolean, error: ?Error} = this.dispatcher.startTask({groupIndex, taskIndex});
      this.store.dispatch(addLogEntry({ type: 'data', data: `[VIRT] Attempting to start task ${groupIndex} ${taskIndex}` }));
      if (response.success) {
        logger.info(`Successfully started task ${groupIndex} ${taskIndex}`);
        return true;
      } else {
        logger.info(`Failed starting task ${groupIndex} ${taskIndex}: error ${response.error ? response.error.message : ""}`);
      }
    } catch (err) {
      console.log(err);
    }
    return false;
  }

  /**
   * Redux saga action to restart VM.
   * @param  {groupIndex}  id Unique task identifier to start
   * @param  {taskIndex}  id Unique task identifier to start
   */
  reqStopTask = async (groupIndex: number, taskIndex: number): Promise<boolean> => {
    if(this.dispatcher === null) {
      return false;
    }
    try {
      const response = await this.dispatcher.stopTask({groupIndex, taskIndex});
      if (response.success) {
        logger.info(`Successfully started task ${groupIndex} ${taskIndex}`);
        return true;
      } else {
        logger.info(`Failed stoppint task ${groupIndex} ${taskIndex}: error ${response.error ? response.error.message : ""}`);
      }
    } catch (err) {
      logger.info(`Failed killing task with error ${err.message}.`);
    }
    return false;
  }
  /**
   * Redux saga action to stop task.
   * @param  {groupIndex}  id Unique task identifier to start
   * @param  {taskIndex}  id Unique task identifier to start
   */
  reqRestartVM = async (): Promise<boolean> => {
    if(this.dispatcher === null) {
      return false;
    }
    try {
      this.dispatcher && await this.dispatcher.down();
      this.dispatcher && await this.dispatcher.downVM();
      this.dispatcher && await this.dispatcher.upVM();
      this.dispatcher && await this.dispatcher.login();
      this.dispatcher && await this.dispatcher.up(false);
      this.dispatcher && this.dispatcher.initializeDispatchStatus();
      logger.info(`Finished restarting VM`);
      return true;
    } catch (err) {
      logger.info(`Failed to start VM with error ${err.message}.`);
    }
    return false;
  }
}
// eslint-disable-next-line import/prefer-default-export
const sharedTaskController = new TaskController();
export default sharedTaskController;
