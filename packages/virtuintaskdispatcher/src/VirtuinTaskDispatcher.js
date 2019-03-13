// @flow
import type {
  PRDispatchInput, PRDispatchWithResponseInput, ManageGroupTasks, ProduceRouterPrompt
} from 'virtuin-task-rest-service/build/types/types';
import RestServer from 'virtuin-task-rest-service';
import type {
  Task, RootInterface, CollectionEnvs, GroupMode
} from './types';

const os = require('os');
const ospath = require('ospath');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const dotenv = require('dotenv');
const fse = require('fs-extra');
const uuidv4 = require('uuid/v4');
const yaml = require('js-yaml');
const vagrant = require('./vagrant');
const { diff } = require('deep-diff');

// const RestServer = require('virtuin-rest-service');
const shellEnv = require('shell-env');
const processEnvs = shellEnv.sync()


type TaskState = 'IDLE' | 'START_REQUEST' | 'RUNNING' | 'KILLED' | 'STOP_REQUEST' | 'FINISHED';

type DockerCredentials = {
  username: string,
  password: string,
  server: ?string
}

type CurrentTaskHandle = {
  taskIdent: TaskIdentifier,
  activeTask: Object,
  cbHandles: {[string]: {uuid: string}} // , Promise<any>})
}

export type TaskIdentifier = {| groupIndex: number, taskIndex: number |};
export type TaskStatus = {|
  name: string,
  description: string,
  enabled: boolean,
  progress: number,
  identifier: TaskIdentifier,
  state: TaskState,
  taskUUID: ?string,
  error: ?string,
  viewURL: ?string,
  startDate: ?string,
  completeDate: ?string,
  messages: Array<string>,
  stdout: string,
  stderr: string
|};
export type DispatchCallbacks = {|
  uuid: string,
  message: string
|}
export type DispatchPrimaryStatus = {|
  collectionState: 'Not Loaded' | 'Loaded',
  statusMessage: string,
  logMessage: string,
  callbacks: {string?: DispatchCallbacks},
  stdout: string,
  stderr: string
|}
export type DispatchStatus = {|
  ...DispatchPrimaryStatus,
  groups: Array<{|
    name: string,
    description: string,
    mode: GroupMode,
    autoStart: boolean,
    tasksStatus: Array<TaskStatus>
  |}>
|}


class VirtuinTaskDispatcher extends EventEmitter {
  daemonAddress: string;

  daemonArgs: Array<string>;

  stackBasePath: string;

  vagrantDirectory: ?string;

  collectionEnvPath: ?string;

  collectionPath: string;

  ymlPath: string;

  collectionEnvs: ?Object;

  promptHandler: ?((ProduceRouterPrompt) => Promise<string>)

  verbosity: number;

  stationName: string;

  dispatchStatus: DispatchStatus;

  envs: CollectionEnvs & {COMPOSE_CONVERT_WINDOW_PATHS: number,
    COMPOSE_FORCE_WINDOWS_HOST: number} & Object;

  dockerCredentials: ?DockerCredentials;

  collectionDef: RootInterface;

  restServer: (RestServer);

  currTaskHandles: Array<CurrentTaskHandle>;

  constructor(
    stationName: string,
    collectionEnvs: CollectionEnvs,
    collectionDef: RootInterface,
    stackBasePath: ?string = null,
    verbosity: number = 0,
    collectionEnvPath: ?string = null,
  ) {
    super();
    this.dockerCredentials = null;
    this.stackBasePath = stackBasePath || os.tmpdir();
    this.vagrantDirectory = collectionEnvs.VIRT_VAGRANT_DIRECTORY;
    this.collectionEnvPath = collectionEnvPath;
    this.collectionEnvs = collectionEnvs;
    this.stationName = stationName;
    this.verbosity = verbosity;
    this.promptHandler = null;

    this.collectionDef = collectionDef;
    this.currTaskHandles = [];

    // these have to be initialized after previous
    this.daemonAddress = collectionEnvs.VIRT_DOCKER_HOST || 'tcp://0.0.0.0:2375';
    this.collectionPath = path.join(this.composePath(), 'collection.json');
    this.ymlPath = path.join(this.composePath(), 'docker-compose.yml');
    this.daemonArgs = ['-H', this.daemonAddress, '-f', this.ymlPath];

    this.initializeDispatchStatus();
    this.envs = {
      VIRT_STATION_NAME: this.stationName,
      COMPOSE_CONVERT_WINDOW_PATHS: 1,
      COMPOSE_FORCE_WINDOWS_HOST: 0,
      DOCKER_HOST: this.daemonAddress,
      VIRT_COLLECTION_ENV_PATH: (this.collectionDef) ? collectionEnvPath: undefined,
      ...collectionEnvs
    };
    if (collectionEnvs && collectionEnvs.VIRT_DOCKER_USER && collectionEnvs.VIRT_DOCKER_PASSWORD) {
      this.dockerCredentials = {
        username: collectionEnvs.VIRT_DOCKER_USER,
        password: collectionEnvs.VIRT_DOCKER_PASSWORD,
        server: collectionEnvs.VIRT_DOCKER_HOST,
      };
    }
    this.restServer = new RestServer();
    const { dispatch, dispatchWithResponse } = this;
    RestServer.setProducerDelegate({ dispatch, dispatchWithResponse });
    this.restServer.begin();
    this.updateDispatchPrimaryStatus({ collectionState: 'Loaded' });
  }

  //Call to refresh the state
  initializeDispatchStatus = (): void => {
    this.dispatchStatus = VirtuinTaskDispatcher.genInitDispatchStatusForDef(this.collectionDef);
  }

  static genInitDispatchStatus = (): DispatchStatus => ({
    collectionState: 'Not Loaded',
    statusMessage: '',
    logMessage: '',
    callbacks: {},
    stdout: '',
    stderr: '',
    groups: []
  })

  manageGroupTasks = async (groupIndex: number, command : ManageGroupTasks) : Promise<string> => {
    let currStatus = this.getStatus();
    if(groupIndex >= currStatus.groups.length) {
      throw Error("Invalid group index");
    }
    if(command.reset && ((typeof command.reset === 'string' && command.reset === 'all') || Array.isArray(command.reset))) {
      for(const i of currStatus.groups[groupIndex].tasksStatus.keys()) {
        const taskIdent = {groupIndex, taskIndex: i};
        if(command.reset === 'all' || (command.reset && command.reset.includes(i))) {
          this.updateTaskStatus(taskIdent, VirtuinTaskDispatcher.genInitTaskStatusForTaskIdent(taskIdent, this.collectionDef));
        }
      }
    }
    if(command.disable && ((typeof command.disable === 'string' && command.disable === 'all') || Array.isArray(command.disable))) {
      for(const i of currStatus.groups[groupIndex].tasksStatus.keys()) {
        const taskIdent = {groupIndex, taskIndex: i};
        if(command.disable === 'all' || (command.disable && command.disable.includes(i))) {
          this.updateTaskStatus(taskIdent, {enabled: false});
        }
      }
    }
    if(command.enable && ((typeof command.enable === 'string' && command.enable === 'all') || Array.isArray(command.enable))) {
      for(const i of currStatus.groups[groupIndex].tasksStatus.keys()) {
        const taskIdent = {groupIndex, taskIndex: i};
        if(command.enable === 'all' || (command.enable && command.enable.includes(i))) {
          this.updateTaskStatus(taskIdent, {enabled: true});
        }
      }
    }
    return "success";

  }

  static genInitTaskStatusForTaskIdent = (taskIdent: TaskIdentifier, collectionDef: RootInterface): TaskStatus => {
    const groups = collectionDef.taskGroups;
    const task: Task = groups[taskIdent.groupIndex].tasks[taskIdent.taskIndex];
    return {
      name: task.name,
      description: task.description || '',
      enabled: (typeof groups[taskIdent.groupIndex].mode === 'undefined' ||
        groups[taskIdent.groupIndex].mode === 'user' || taskIdent.taskIndex === 0) ? true : false, //if managed will require post to allow next task run
      progress: 0,
      identifier: { groupIndex: taskIdent.groupIndex, taskIndex: taskIdent.taskIndex },
      state: 'IDLE',
      taskUUID: null,
      error: null,
      viewURL: task.viewURL,
      startDate: null,
      completeDate: null,
      messages: [],
      stdout: '',
      stderr: ''
    };
  }

  static genInitDispatchStatusForDef = (collectionDef: RootInterface): DispatchStatus => {
    const groups = collectionDef.taskGroups;
    return {
      collectionState: 'Not Loaded',
      statusMessage: '',
      logMessage: '',
      callbacks: {},
      stdout: '',
      stderr: '',
      groups: Array(groups.length).fill().map((ignore, i) => ({
        name: groups[i].name || 'No name',
        description: groups[i].description || '',
        mode: groups[i].mode || 'user',
        autoStart: groups[i].autoStart,
        tasksStatus: Array(groups[i].tasks.length).fill().map((ignore2, j) => VirtuinTaskDispatcher.genInitTaskStatusForTaskIdent({ groupIndex: i, taskIndex: j }, collectionDef))
      }))
    };
  }

  getTaskIdentifierFromUUID = (taskUUID: string): ?TaskIdentifier => {
    for (const i of this.dispatchStatus.groups.keys()) {
      const j = this.dispatchStatus.groups[i].tasksStatus.findIndex((task) => task.taskUUID && task.taskUUID === taskUUID);
      if (j >= 0) {
        return { groupIndex: i, taskIndex: j };
      }
    }
    return null;
  }

  // ProduceRouterDelegate
  /**
   * dispatch
   * Handles simple messages from the rest end point
  */
  dispatch = (o: PRDispatchInput): void => {
    if (o.type === 'progress') {
      console.log('dispatch', o);
      const t = this.getTaskIdentifierFromUUID(o.taskUUID);
      console.log('taskIdentifier', t);
      if (t && o.percent) {
        const c = this.statusFromIdentifier(t);
        this.updateTaskStatus(t, { progress: o.percent });
      }
    } else if (o.type === 'message') {
      const t = this.getTaskIdentifierFromUUID(o.taskUUID);
      if (t && o.message) {
        const c = this.statusFromIdentifier(t);
        this.updateTaskStatus(t, { messages: [...c.messages, o.message] });
      }
    }
    console.log(`called dispatch: received ${o.type} for ${o.taskUUID}`);
  }

  /**
   * dispatchWithResponse
   * Handles messages where a response is expected
  */
  dispatchWithResponse = async (o: PRDispatchWithResponseInput): Promise<any> => {
    console.log(`called dispatchWithResponse: received ${o.type}`);
    if (o.type === 'manage') {
      const t = this.getTaskIdentifierFromUUID(o.taskUUID);
      if(t) {
        return this.manageGroupTasks(t.groupIndex, o.command);
      } else {
        throw Error("Error - Invalid taskUUID");
      }
    }
    if (o.type === 'prompt') {
      if(this.promptHandler) {
        return this.promptHandler(o);
      } else {
        throw Error("Internal Error - Cannot handle prompt");
      }
    }
    return `received ${o.type}`;
  }
  // End ProduceRouterDelegate

  end = (): void => {
    if (this.restServer) {
      this.restServer.end();
    }
    if (this.vagrantDirectory) {
      vagrant.vagrantEmitter.removeAllListeners();
    }
    if(this.promptHandler) {
      this.promptHandler = null;
    }
    RestServer.setProducerDelegate(null);
  }

  static collectionObjectFromPath(collectionDefPath: string): ?RootInterface {
    const collectionDefData = fs.readFileSync(collectionDefPath);
    if (collectionDefPath.endsWith('.json')) {
      const collectionObject: RootInterface = JSON.parse(collectionDefData.toString());
      return collectionObject;
    }
    const collectionObject: RootInterface = (yaml.safeLoad(collectionDefData.toString()): any);
    return collectionObject;
  }

  static collectionEnvFromPath(collectionEnvPath: ?string): CollectionEnvs {
    const defaultEnvs = {
      VIRT_GUI_SERVER_ADDRESS: "localhost",
      VIRT_DOCKER_HOST: "unix:///var/run/docker.sock"
    }
    let envData = '';
    if(collectionEnvPath) {
      try {
        // fse.statSync(collectionEnvPath);
        envData = fse.readFileSync(path.join(collectionEnvPath, 'collection.env'), 'utf8');
        const buf = Buffer.from(envData, 'utf8');
        const collectionEnvs: CollectionEnvs = (dotenv.parse(buf): any); // will return an object
        return {...defaultEnvs, ...collectionEnvs};
      } catch (error) {
        console.error('Could not access the Collections collection.env file.');
      }
    }

    return defaultEnvs;
  }

  composeName = () => `virt${this.collectionDef.collectionName}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  composePath = () => path.join(this.stackBasePath, this.composeName());

  /**
    * Login to Docker to enable pulling images.
    * Defaults to Docker hub if server not specified.
    * @async
    * @param  {string}  username Docker registry username
    * @param  {string}  password Docker registry password
    * @param  {?string}  server  Docker registry server
    * @return {Promise<void>}
    * @throws
    */
  login = async (): Promise<void> => {
    if (this.dockerCredentials) {
      const cmd = 'docker';
      const args = [
        '-H', this.daemonAddress,
        'login', '-u', this.dockerCredentials.username, '-p', this.dockerCredentials.password
      ];
      if (typeof this.dockerCredentials.server === 'string') {
        args.push(this.dockerCredentials.server);
      }
      const options = {
        cwd: this.composePath(),
        env: { ...processEnvs, ...this.envs },
        shell: false
      };
      const code = await this.spawnAsync(cmd, args, options,
        (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stdout: buffer.toString() }); },
        (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stderr: buffer.toString() }); });

      if (code) {
        throw new Error(`Failed logging into Docker ${code || 'unknown'}`);
      }
    }
  }

  /**
   * Nuclear option. Kill and remove all Docker containers
   * @return {Promise<void>}
   */
  nuke = async (): Promise<void> => {
    // Force kill and prune all containers
    if (this.verbosity) { console.log('Task dispatcher nuking all containers.'); }
    await this.removeContainers();
    await this.pruneContainers();
  }

  /**
   * Brings up Vagrant VM from collection definition.
   * Additionally stops any existing VM's so they do not intefere.
   * @async
   * @param  {RootInterface}  collectionDef Collection definition.
   * @return {Promise<void>}
   * @throws
   */
  upVM = async (fullReload: boolean = false): Promise<void> => {
    try {
      this.updateDispatchPrimaryStatus({ logMessage: 'Ensuring VM Ready' });
      if (this.vagrantDirectory) {
        const cb: ((string) => void) = (status) => {
          this.updateDispatchPrimaryStatus({ logMessage: status });
        };
        await vagrant.ensureOnlyMachineRunningAtDirectory(this.vagrantDirectory, fullReload, cb);
      } else {
        this.updateDispatchPrimaryStatus({ logMessage: 'No VM specified' });
      }
    } catch (error) {
      throw error;
    }
  }

  getTempDirPath = async (): Promise<string> => {
    const tmpPath = path.join(os.tmpdir(), 'virtuin');
    if (!(await fse.exists(tmpPath))) {
      await fse.mkdir(tmpPath);
    }
    return tmpPath;
  }

  /**
   * Starts docker-compose based on yml file.
   * Additionally stops any existing task/ctrl stacks.
   * @async
   * @param  {RootInterface}  collectionDef Collection definition.
   * @return {Promise<void>}
   * @throws
   */
  up = async (fullReload: boolean = false): Promise<void> => {
    try {
      const fullRebuild = this.collectionDef.build === 'development';
      this.updateDispatchPrimaryStatus({ logMessage: 'Starting up task environment.' });
      let objStr = '';
      switch (this.collectionDef.dockerCompose.type || 'RAW') {
        case 'RAW':
          objStr = yaml.safeDump(this.collectionDef.dockerCompose.source);
          break;
        case 'URL':
          throw new Error('Docker stack type URL not yet supported.');
        default:
          throw new Error(`Docker stack type ${this.collectionDef.dockerCompose.type || ''} not yet supported or invalid.`);
      }

      // Check if previous collection exists and if so has same tag
      // If tag doesnt match, then need to perform full reload
      let changes = []; // assume all needs to be cleaned up if no prev collection exists
      let shouldRemoveContainers = false;
      const prevCollectionExists = await fse.pathExists(this.collectionPath);
      if (prevCollectionExists) {
        const prevCollectionDef: RootInterface = await fse.readJson(this.collectionPath);
        if (prevCollectionDef.dockerCompose && this.collectionDef.dockerCompose) {
          changes = diff(prevCollectionDef.dockerCompose, this.collectionDef.dockerCompose);
        }
        if (prevCollectionDef.collectionName !== this.collectionDef.collectionName
          || prevCollectionDef.collectionTag !== this.collectionDef.collectionTag
          || (changes && changes.length > 0)) {
          shouldRemoveContainers = true;
          this.updateDispatchPrimaryStatus({
            logMessage:
              'Using existing task collection environment.'
          });
        } else {
          this.updateDispatchPrimaryStatus({
            logMessage:
              'Creating new task collection environment.'
          });
        }
      }

      // Write compose.yml into stack folder
      await fse.outputFile(this.ymlPath, objStr);

      // Remove all docker containers not in this definition
      const removeAll = fullReload || shouldRemoveContainers;
      await this.removeContainers(removeAll ? undefined : this.composeName());

      // Create environment file
      const envPath = path.join(this.composePath(), '.env');
      let envStr = '';
      const keys = Object.keys(this.envs);
      for (const k of keys) {
        envStr += `${k}=${this.envs[k]}\n`;
      }
      await fse.writeFile(envPath, envStr);

      // Perform pull if reload or tags dont match
      if (removeAll) {
        await this.pull();
      }
      // Perform up
      const cmd = 'docker-compose';
      let args = [
        ...this.daemonArgs, 'up',
        '--remove-orphans', '-d'
      ];
      if (fullRebuild) {
        args = [...args, '--build'];
      }
      const options = {
        cwd: this.composePath(),
        env: { ...processEnvs, ...this.envs },
        shell: false
      };
      const code = await this.spawnAsync(cmd, args, options,
        (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stdout: buffer.toString() }); },
        (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stderr: buffer.toString() }); });
      if (code) {
        throw new Error(`Failed starting up task environment: ${code || 'unknown'}`);
      }
      // Write collection into stack folder on successful up
      // We check collection change to determine bring-up.
      // On failure, we need to ensure we retry complete bring-up.
      await fse.outputFile(this.collectionPath, JSON.stringify(this.collectionDef));
      this.updateDispatchPrimaryStatus({
        logMessage:
       'Successfully started task environment.'
      });
      return;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Stops docker-compose based on yml file.
   * Optionally remove containers.
   * @async
   * @return {Promise<void>}
   * @throws
   */
  down = async (rm: boolean = false): Promise<void> => {
    try {
      this.updateDispatchPrimaryStatus({
        logMessage:
        'Stopping task environment.'
      });
      // Perform docker-compose down or stop
      const cmd = 'docker-compose';
      const args = [...this.daemonArgs, rm ? 'down' : 'stop'];
      const options = {
        cwd: this.composePath(),
        env: { ...processEnvs, ...this.envs },
        shell: false
      };
      const code = await this.spawnAsync(cmd, args, options,
        (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stdout: buffer.toString() }); },
        (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stderr: buffer.toString() }); });
      if (code) {
        throw new Error(`Failed stopping task environment: ${code || 'unknown'}`);
      }
      this.updateDispatchPrimaryStatus({
        logMessage:
        'Successfully stopped task environment.'
      });
      return;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Stops vagrant virtual machine based on yml file.
   * Optionally remove containers.
   * @async
   * @return {Promise<void>}
   * @throws
   */
  downVM = async (): Promise<boolean> => {
    try {
      this.updateDispatchPrimaryStatus({
        logMessage:
      'Bringing Vagrant VM Down'
      });
      if (this.vagrantDirectory) {
        const s = await vagrant.vagrantStopVMInDirectory(this.vagrantDirectory);
        if (s) {
          this.updateDispatchPrimaryStatus({
            logMessage:
            'Vagrant VM successfully brought down'
          });
          return true;
        }
        this.updateDispatchPrimaryStatus({
          logMessage:
            'Unable to bring Vagrant VM down'
        });
        return false;
      }
      this.updateDispatchPrimaryStatus({
        logMessage:
          'No Vagrant VM in specified collection'
      });
      return false;
    } catch (error) {
      throw error;
    }
  }

  /**
   * INTERNAL
   * Pull tagged images defined in compose definition.
   * @private
   * @return {Promise<void>}
   * @throws
   */
  pull = async (): Promise<void> => {
    this.updateDispatchPrimaryStatus({
      logMessage:
      'Pulling collection service\'s images.'
    });
    if (this.dockerCredentials) {
      await this.login();
    }
    const cmd = 'docker-compose';
    const args = [...this.daemonArgs, 'pull'];
    const options = {
      cwd: this.composePath(),
      env: { ...processEnvs, ...this.envs },
      shell: false
    };
    try {
      const code = await this.spawnAsync(cmd, args, options,
        (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stdout: buffer.toString() }); },
        (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stderr: buffer.toString() }); });

      if (code !== 0) {
        throw new Error(`Failed pulling service's images: ${code || 'unknown'}`);
      }
    } catch (error) {
      console.log(`Caught error ${error}`);
    }
    this.updateDispatchPrimaryStatus({
      logMessage:
      'Successfully pulled collection service\'s images.'
    });
  }

  sendTaskInputDataFile = async (taskIdent: TaskIdentifier): Promise<{success: boolean,
    error: ?Error}> => {
    if (!this.validTaskIdentifier(taskIdent)) {
      return { success: false, error: Error(`task identifier is not valid group ${taskIdent.groupIndex}, task ${taskIdent.taskIndex}`) };
    }
    const task: Task = (this.taskFromIdentifier(taskIdent): any);
    // Perform up
    this.updateDispatchPrimaryStatus({
      statusMessage:
      'Task send data requested.'
    });

    try {
      //const newTaskUUID = this.generateUUID();
      const newTaskUUID = '0000000';
      const runConfigs = task.dockerInfo || {};
      const runServiceName = runConfigs.serviceName;
      const runCmd = runConfigs.command;
      let runArgs = Array.isArray(runConfigs.args) ? runConfigs.args : [runConfigs.args];

      // Create task JSON file and copy to container
      const taskInputPath = path.join(this.composePath(), 'input');
      const taskSrcPath = path.join(taskInputPath, 'task.json');
      const taskDstPath = `/virtuin_task-${taskIdent.groupIndex}-${taskIdent.taskIndex}.json`;
      // eslint-disable-line camelcase
      const { virt_stations, ...sharedData } = task.data;
      const taskData = ({
        // eslint-disable-line camelcase
        data: { ...sharedData, ...virt_stations[this.stationName] },
        taskUUID: newTaskUUID,
        groupIndex: taskIdent.groupIndex,
        taskIndex: taskIdent.taskIndex,
        allTasksInfo: this.getStatus().groups[taskIdent.groupIndex].tasksStatus.map(task => {
            return {
              name: task.name,
              enabled: task.enabled,
              state: task.state,
              taskUUID: task.taskUUID || null,
              groupIndex: task.identifier.groupIndex,
              taskIndex: task.identifier.taskIndex,
              progress: (typeof task.progress === 'number') ? task.progress : 0
            }
          })
      });
      const taskStr = JSON.stringify(taskData);
      await fse.outputFile(taskSrcPath, taskStr);
      const containerId = await this.getServiceContainerId(runServiceName);
      await this.copyContainer(containerId, taskSrcPath, taskDstPath);
      return { success: false, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Begin Tasks if Auto Start enabled on gruop
   * @param  {Object}  taskConfig Task definition object
   * @return {Promise<{ success: boolean, error: Error}>}
   */
  beginTasksIfAutoStart = async (rebuildService: boolean = false): Promise<{ success: boolean, error: ?Error}> => {
    const groups = this.collectionDef.taskGroups;
    let anyError = null;
    for (const index of groups.keys()) {
      if (groups[index].autoStart === true) {
        const { success, error } = await this.startTask({ groupIndex: index, taskIndex: 0 }, rebuildService);
        if (error) {
          anyError = error;
          break;
        }
      }
    }
    return { success: anyError === null, error: anyError };
  }

  // Perform up
  /**
   * Start a task
   * @param  {Object}  taskConfig Task definition object
   * @return {Promise<{ success: boolean, error: Error}>}
   */
  startTask = async (taskIdent: TaskIdentifier, rebuildService: boolean = false): Promise<{ success: boolean, error: ?Error}> => {
    // Perform up
    if (!this.validTaskIdentifier(taskIdent)) {
      return { success: false, error: Error(`task identifier is not valid group ${taskIdent.groupIndex}, task ${taskIdent.taskIndex}`) };
    }
    const task: Task = (this.taskFromIdentifier(taskIdent): any);
    const groupStatus = this.dispatchStatus.groups[taskIdent.groupIndex];
    // const currStatus: TaskStatus = groupStatus.tasksStatus[taskIdent.taskIndex];
    const cmd = 'docker-compose';
    // Reset the status fields for the task
    this.updateTaskStatus(taskIdent, VirtuinTaskDispatcher.genInitTaskStatusForTaskIdent(taskIdent, this.collectionDef));

    if (rebuildService && task.dockerInfo
      && task.dockerInfo.serviceName) {
      this.updateDispatchPrimaryStatus({ statusMessage: `rebuilding service ${task.dockerInfo.serviceName}.` });
      const args = [
        ...this.daemonArgs, 'up', '-d', '--build', `${task.dockerInfo.serviceName}`
      ];
      const options = {
        cwd: this.composePath(),
        env: { ...processEnvs, ...this.envs },
        shell: false
      };
      try {
        const code = await this.spawnAsync(cmd, args, options,
          (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stdout: buffer.toString() }); },
          (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stderr: buffer.toString() }); });
        if (code) {
          throw new Error(`Failed rebuilding service ${task.dockerInfo.serviceName}
            error: ${code || 'unknown'}`);
        }
      } catch (e) {
        // This may only be due to the fact that has not changed so ignore
        console.error(`start task failed to rebuild the service ${task.dockerInfo.serviceName}`);
      }
    }
    this.updateDispatchPrimaryStatus({ statusMessage: 'Task start dispatch requested.' });

    // Return if task is already running
    for (const taskStatus of groupStatus.tasksStatus) {
      if (['IDLE', 'KILLED', 'FINISHED'].find(s => s === taskStatus.state) === undefined) {
        return { success: false, error: new Error('Task ${taskStatus.name} already running in the group ${}') };
      }
    }
    // Update status
    const newTaskUUID = this.generateUUID();
    this.updateTaskStatus(taskIdent, {
      name: task.name,
      taskUUID: newTaskUUID,
      state: 'START_REQUEST',
      startDate: new Date().toISOString(),
      completeDate: null,
      error: null
    });

    try {
      const runConfigs = task.dockerInfo || {};
      const runServiceName = runConfigs.serviceName;
      const runCmd = runConfigs.command;
      let runArgs = Array.isArray(runConfigs.args) ? runConfigs.args : [runConfigs.args];

      // Create task JSON file and copy to container
      const taskInputPath = path.join(this.composePath(), 'input');
      const taskSrcPath = path.join(taskInputPath, 'task.json');
      const taskDstPath = `/virtuin_task-${taskIdent.groupIndex}-${taskIdent.taskIndex}.json`;
      // eslint-disable-line camelcase
      const { virt_stations, ...sharedData } = task.data;
      const taskData = ({
        // eslint-disable-line camelcase
        data: { ...sharedData, ...virt_stations[this.stationName] },
        taskUUID: newTaskUUID,
        groupIndex: taskIdent.groupIndex,
        allTasksInfo: this.getStatus().groups[taskIdent.groupIndex].tasksStatus.map(task => {
            return {
              name: task.name,
              enabled: task.enabled,
              state: task.state,
              taskUUID: task.taskUUID || null,
              groupIndex: task.identifier.groupIndex,
              taskIndex: task.identifier.taskIndex,
              progress: (typeof task.progress === 'number') ? task.progress : 0
            }
          })
      });
      const taskStr = JSON.stringify(taskData);
      await fse.outputFile(taskSrcPath, taskStr);
      const containerId = await this.getServiceContainerId(runServiceName);
      await this.copyContainer(containerId, taskSrcPath, taskDstPath);
      runArgs = runArgs.concat(['--filepath', taskDstPath]);

      // Perform docker-compose exec
      // eslint-disable-line no-unused-vars
      let port = 0;
      let ignore = '';
      if (this.restServer) {
        ([ignore, port] = await this.restServer.getAddressAndPort());
      }
      let envVar = (port > 0) ? ['-e', `VIRT_REST_API_PORT=${port}`] : [];
      envVar.push(['-e', `VIRT_TASK_INPUT_FILE='${taskDstPath}'`])
      const args = [
        ...this.daemonArgs,
        'exec',
        '-T',
        ...envVar,
        runServiceName,
        runCmd,
        ...runArgs
      ];
      this.updateDispatchPrimaryStatus({
        statusMessage:
        `${cmd} ${args.join(' ')}`
      });
      const options = {
        cwd: this.composePath(),
        env: { ...processEnvs, ...this.envs },
        shell: false
      };

      const activeTask = spawn(cmd, args, options);
      const currIndex = this.currTaskHandles.indexOf(obj => obj.taskIdent.groupIndex === taskIdent.groupIndex && obj.taskIdent.taskIndex === taskIdent.taskIndex);
      if (currIndex >= 0) { // Should never get here

      }
      this.currTaskHandles = [...this.currTaskHandles, { taskIdent, activeTask, cbHandles: {} }];

      this.updateTaskStatus(taskIdent, {
        state: 'RUNNING',
        error: null
      });
      activeTask.on('exit', (code: number, signal: ?number) => { this.taskFinishHandler(taskIdent, activeTask, code, signal); });
      activeTask.stdout.on('data', (buffer: Buffer) => { this.taskSTDOutHandler(taskIdent, buffer); });
      activeTask.stderr.on('data', (buffer: Buffer) => { this.taskSTDErrHandler(taskIdent, buffer); });
      this.updateDispatchPrimaryStatus({
        statusMessage:
        'Successfully dispatched task start.'
      });

      return { success: true, error: null };
    } catch (err) {
      this.updateTaskStatus(taskIdent, {
        state: 'KILLED',
        error: `Failed spawning task: ${err.message}`
      });
      return { success: false, error: new Error(err.message) };
    }
  }

  taskFromIdentifier = (taskIdent: TaskIdentifier): ?Task => {
    const tasks = this.collectionDef.taskGroups[taskIdent.groupIndex].tasks || [];
    if (taskIdent.taskIndex < 0 && taskIdent.taskIndex >= tasks.length) {
      return null;
    }
    return tasks[taskIdent.taskIndex];
  }

  statusFromIdentifier = (taskIdent: TaskIdentifier): TaskStatus => {
    const currStatus = this.dispatchStatus.groups[taskIdent.groupIndex].tasksStatus[taskIdent.taskIndex];
    return currStatus;
  }

  validTaskIdentifier = (taskIdent: TaskIdentifier): boolean => {
    const tasks = this.collectionDef.taskGroups[taskIdent.groupIndex].tasks || [];
    if (taskIdent.taskIndex < 0 && taskIdent.taskIndex >= tasks.length) {
      return false;
    }
    return true;
  }

  /**
   * Stop a running task
   * @param  {?string} taskUUID Unique id of task (optional). null stops current task.
   * @return {Promise<{ success: boolean, error: Error}>}
   */
  stopTask = async (taskIdent: TaskIdentifier): Promise<{ success: boolean, error: ?Error }> => {
    if (!this.validTaskIdentifier(taskIdent)) {
      return { success: false, error: Error(`task identifier is not valid group ${taskIdent.groupIndex}, task ${taskIdent.taskIndex}`) };
    }
    this.updateDispatchPrimaryStatus({ statusMessage: 'Task stop dispatch requested.' });
    // Return success if no task running
    const currStatus = this.statusFromIdentifier(taskIdent);
    if (['IDLE', 'KILLED', 'FINISHED'].find(s => s === currStatus.state) !== undefined) {
      return { success: true, error: null };
    }
    // Return failure if task not in valid state (i.e. KILLED, STARTING, STOPPING)
    if (currStatus.state !== 'RUNNING') {
      return { success: false, error: new Error(`Cant stop task in state ${currStatus.state}`) };
    }

    this.updateTaskStatus(taskIdent, {
      state: 'STOP_REQUEST',
      error: null
    });
    try {
      const currIndex = this.currTaskHandles.indexOf(obj => obj.taskIdent.groupIndex === taskIdent.groupIndex && obj.taskIdent.taskIndex === taskIdent.taskIndex);
      if (currIndex >= 0) { // Should never get here
        const activeTask = this.currTaskHandles[currIndex].activeTask;
        activeTask.kill('SIGTERM'); // Ask nicely
        setTimeout(async () => {
          // If same task and still not exited then let'em have it
          const c = this.statusFromIdentifier(taskIdent);
          const t = this.taskFromIdentifier(taskIdent);
          if (currStatus.taskUUID && c.state === 'STOP_REQUEST') {
            activeTask.kill('SIGKILL');
            if (t && t.dockerInfo && t.dockerInfo.serviceName) {
              await this.restartService(t.dockerInfo.serviceName);
            }
            const c = this.currTaskHandles.indexOf(obj => obj.taskIdent.groupIndex === taskIdent.groupIndex && obj.taskIdent.taskIndex === taskIdent.taskIndex);
            if (c >= 0) { // Should never get here
              this.currTaskHandles = [
                ...this.currTaskHandles.slice(0, c),
                ...this.currTaskHandles.slice(c + 1)
              ];
            }
          }
        }, 1500);
      }
      this.updateDispatchPrimaryStatus({ statusMessage: 'Successfully dispatched task stop.' });
    } catch (err) {
      this.updateTaskStatus(taskIdent, {
        state: 'KILLED',
        error: `Failed stopping task: ${err.message}`
      });
      return { success: false, error: err };
    }
    this.updateTaskStatus(taskIdent, {
      state: 'KILLED',
      completeDate: new Date().toISOString(),
      error: null
    });
    this.updateDispatchPrimaryStatus({ statusMessage: 'Successfully dispatched task stop.' });
    return { success: true, error: null };
  }

  /**
   * Clears status of finished task.
   * @return {{  success: boolean, error: Error }}
   */
  clearTask = (taskIdent: TaskIdentifier): { success: boolean, error: ?Error} => {
    this.updateDispatchPrimaryStatus({ statusMessage: 'Task clear dispatch requested.' });
    // If existing task not finished then cant clear
    const currStatus = this.statusFromIdentifier(taskIdent);
    if (['IDLE', 'KILLED', 'FINISHED'].find(s => s === currStatus.state) === undefined) {
      return { success: false, error: new Error(`Cant clear in state ${currStatus.state}`) };
    }
    this.updateTaskStatus(taskIdent, {
      state: 'IDLE',
      error: null,
    });
    this.updateDispatchPrimaryStatus({ statusMessage: 'Successfully dispatched task clear.' });
    return { success: true, error: null };
  }

  /**
   * INTERNAL
   * Used to update task status
   * @private
   * @param  {TaskStatus} status New task status
   * @param  {boolean} merge     If should merge or replace
   * @return {void}
   */


  updateDispatchPrimaryStatus = (primaryStatus: $Shape<DispatchPrimaryStatus>) => {
    this.dispatchStatus = {
      ...this.dispatchStatus,
      ...primaryStatus
    };
    this.emit('task-status', this.getStatus());
  }

  updateTaskStatus = (taskIdentifier: TaskIdentifier, newTaskStatus: $Shape<TaskStatus>) => {
    this.dispatchStatus = {
      ...this.dispatchStatus,
      groups: this.dispatchStatus.groups.map((groupItem, i) => {
        if (i !== taskIdentifier.groupIndex) {
          return groupItem;
        }
        return {
          ...groupItem,
          tasksStatus: groupItem.tasksStatus.map((taskStatus, j) => {
            if (j !== taskIdentifier.taskIndex) {
              return taskStatus;
            }
            return {
              ...taskStatus,
              ...newTaskStatus,
            };
          })
        };
      })
    };
    this.emit('task-status', this.getStatus());
  }

  /**
   * Returns copy of task status
   * @return {TaskStatus} Task status
   */
  getStatus = (): DispatchStatus => ({
    ...this.dispatchStatus
  });

  /**
   * INTERNAL
   * Generates UUID for new task
   * @private
   * @return {[type]}           [description]
   */
  generateUUID = (): string => (
    uuidv4()
  );


  /**
   * INTERNAL
   * Restart a service (docker-compose restart)
   * @private
   * @param  {string}  serviceName Service name
   * @return {Promise<void>}
   * @throws
   */
  restartService = async (serviceName: string): Promise<void> => {
    const timeout = (2000 / 1000).toPrecision(1);
    const cmd = 'docker-compose';
    const args = [...this.daemonArgs, 'restart', '-t', timeout, serviceName];
    const options = {
      cwd: this.composePath(),
      env: { ...processEnvs, ...this.envs },
      shell: false
    };
    const code = await this.spawnAsync(cmd, args, options,
      (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stdout: buffer.toString() }); },
      (buffer: Buffer) => { this.updateDispatchPrimaryStatus({ stderr: buffer.toString() }); });

    if (code) {
      throw new Error(`Failed restarting service ${serviceName}: ${code || 'unknown'}.`);
    }
  }

  /**
   * INTERNAL
   * Get id for given service name
   * @private
   * @param  {string}  serviceName Name of service
   * @return {Promise<string>} Container id
   * @throws
   */
  getServiceContainerId = async (serviceName: string) => {
    const cmd = 'docker-compose';
    const args = ['-H', this.daemonAddress, 'ps', '-q', serviceName];
    const options = {
      cwd: this.composePath(),
      env: { ...processEnvs, ...this.envs },
      shell: false
    };
    let containerId = '';
    const code = await this.spawnAsync(cmd, args, options, (data) => {
      containerId += data.toString();
    });
    if (code) {
      throw new Error(`Failed getting ID of service ${serviceName}: ${code || 'unknown'}.`);
    }
    containerId = containerId.trim();
    return containerId;
  }

  /**
   * INTERNAL
   * Convenience function to spawn process as promise
   * @private
   * @param  {string}  cmd     Command to execute
   * @param  {Array<string>}  args    Process arguments
   * @param  {Object}  options Process options
   * @param  {?(data: Buffer)=>void}  stdout  stdout callback
   * @param  {?(data: Buffer)=>void}  stderr  stdout callback
   * @return {Promise<number>} Exit code
   */
  spawnAsync = async (
    cmd: string,
    args: Array<string> = [],
    options: Object = { env: { ...processEnvs, ...this.envs }, shell: false },
    stdout: ?(data: Buffer)=>void = null,
    stderr: ?(data: Buffer)=>void = null): Promise<?number> => {
    const proc = spawn(cmd, args, options);
    proc.on('error', err => {
      console.log(`spawn error: ${err.message}`);
    });
    if (stdout) {
      proc.stdout.on('data', stdout);
    }
    if (stderr) {
      proc.stderr.on('data', stderr);
    }
    const p = new Promise((resolve) => {
      try {
        proc.on('exit', (code: ?number) => {
          resolve(code);
        });
      } catch (error) {
        resolve(-2);
      }
    });
    return p;
  }


  /**
   * INTERNAL
   * Callback for active task process std output
   * @private
   * @param  {Buffer} buffer Std output
   * @return {void}
   */
  taskSTDOutHandler = (taskIdentifier: TaskIdentifier, buffer: Buffer): void => {
    const bufStr = buffer.toString('utf8');
    const currStatus = this.statusFromIdentifier(taskIdentifier);
    this.updateTaskStatus(taskIdentifier, {
      //stdout: (currStatus.stdout + bufStr).slice(-200)
      stdout: currStatus.stdout + bufStr
    });
  }

  /**
   * INTERNAL
   * Callback for active task process std error
   * @private
   * @param  {Buffer} buffer Std output
   * @return {void}
   */
  taskSTDErrHandler = (taskIdentifier: TaskIdentifier, buffer: Buffer): void => {
    const bufStr = buffer.toString();
    const currStatus = this.statusFromIdentifier(taskIdentifier);
    this.updateTaskStatus(taskIdentifier, {
      //stderr: (currStatus.stderr + bufStr).slice(-200)
      stderr: currStatus.stderr + bufStr
    });
  }

  /**
   * INTERNAL
   * Callback for active task exit
   * @private
   * @param  {number}  code   Exit code
   * @param  {?number} signal Signal received
   * @return {Promise<void>}
   */
  taskFinishHandler = async (taskIdent: TaskIdentifier, activeTask: Object, code: number, signal: ?number): Promise<void> => {
    if (!this.validTaskIdentifier(taskIdent)) {
      return;
    }
    const currStatus = this.statusFromIdentifier(taskIdent);
    const task: Task = (this.taskFromIdentifier(taskIdent): any);
    const stopRequest = currStatus.state === 'STOP_REQUEST';
    activeTask.removeAllListeners('exit');
    if (activeTask.stdout != null) {
      activeTask.stdout.removeAllListeners('data');
    }
    if (activeTask.stderr != null) {
      activeTask.stderr.removeAllListeners('data');
    }
    const errMsg = (code === 0)
      ? null
      : `Task prematurely exited (code:${code || ''}, signal:${signal || ''}).\n`;
    this.updateTaskStatus(taskIdent, {
      state: stopRequest ? 'KILLED' : 'FINISHED',
      completeDate: new Date().toISOString(),
      error: errMsg
    });
    const c = this.currTaskHandles.indexOf(obj => obj.taskIdent.groupIndex === taskIdent.groupIndex && obj.taskIdent.taskIndex === taskIdent.taskIndex);
    if (c >= 0) { // Should never get here
      this.currTaskHandles = [
        ...this.currTaskHandles.slice(0, c),
        ...this.currTaskHandles.slice(c + 1)
      ];
    }

    // On failure or stop request, restart service
    if (stopRequest || code !== 0) {
      try {
        if (task.dockerInfo && task.dockerInfo.serviceName) {
          await this.restartService(task.dockerInfo.serviceName);
        }
      } catch (err) {
        this.emit('error', new Error(`${err.message}`));
      }
    }
  };

  /**
   * INTERNAL
   * Copies file/folders to a container
   * @private
   * @param  {string}  containerId Container Id
   * @param  {string}  srcPath Host source path
   * @param  {string}  dstPath Container destination path
   * @return {Promise<void>}
   * @throws
   */
  copyContainer = async (containerId: string, srcPath: string, dstPath: string): Promise<void> => {
    const cmd = 'docker';
    const args = ['-H', this.daemonAddress, 'cp', srcPath, `${containerId}:${dstPath}`];
    const code = await this.spawnAsync(cmd, args);
    if (code) {
      throw new Error(`Failed copying file to container: ${code || 'unknown'}`);
    }
  }

  /**
   * INTERNAL
   * Removes all stopped containers
   * @private
   * @return {Promise<void>}
   * @throws
   */
  pruneContainers = async (): Promise<void> => {
    const cmd = 'docker';
    const args = ['-H', this.daemonAddress, 'container', 'prune', '--force'];
    const code = await this.spawnAsync(cmd, args);
    if (code) {
      throw new Error(`Failed pruning stopped containers: ${code || 'unknown'}`);
    }
  }

  /**
   * INTERNAL
   * Stops and removes containers that dont match exlusion prefix.
   * Useful for stopping all image containers not defined in compose
   * @private
   * @param  {string}  exclusionPrefix Filter out by name prefix
   * @return {Promise<void>}
   * @throws
   */
  removeContainers = async (exclusionPrefix: ?string = undefined): Promise<void> => {
    // Get container ids for exclusion
    let excludeContainerIds = [];
    if (exclusionPrefix) {
      let erst = '';
      await this.spawnAsync('docker', ['-H', this.daemonAddress, 'ps', '-a', '--filter', `name=${exclusionPrefix}`, '-q'], {},
        (data) => { erst += data.toString(); });
      excludeContainerIds = erst.split('\n').filter(x => x);
    }
    // Get all container ids
    let prst = '';
    await this.spawnAsync('docker', ['-H', this.daemonAddress, 'ps', '-a', '--filter', 'name=virt', '-q'], {},
      (data) => { prst += data.toString(); });
    // Get container ids for removal and remove
    const removeContainerIds = prst.split('\n').filter(x => x && !excludeContainerIds.some(id => id === x));
    this.updateDispatchPrimaryStatus({
      logMessage:
      `Reusing previous service containers: ${excludeContainerIds.join(' ')}`
    });
    this.updateDispatchPrimaryStatus({
      logMessage:
      `Removing following containers: ${removeContainerIds.join(' ')}`
    });
    await this.spawnAsync('docker', ['-H', this.daemonAddress, 'rm', '--force', ...removeContainerIds], {},
      (data) => { prst += data.toString(); });
  }
}
export default { VirtuinTaskDispatcher };
