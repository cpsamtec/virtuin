// @flow
// import * as os from 'os';
// import * as path from 'path';
// import * as fs from 'fs';
// import * as dotenv from 'dotenv';
import type { ProduceRouterDelegate } from 'virtuin-rest-service';
import type { RootInterface, CollectionEnvs } from './types';
// import type { ProduceRouterDelegate } from './VirtuinTaskDispatcher';

const os = require('os');
const path = require('path');
const fs = require('fs');
const program = require('commander');
const { VirtuinTaskDispatcher } = require('./VirtuinTaskDispatcher');

type InputCommandType = 'run' | 'up' | 'down' | 'upVM' | 'downVM' | 'sendData'

// import VirtuinTaskDispatcher from './VirtuinTaskDispatcher';
// Define required arguments
let inputCommand: InputCommandType = 'run';
let collectionDefPath: string;
let groupIndex: number = 0;
let taskIndex: number = 0;
let verbosity: number = 0;
let fullReload: boolean = false;

program
  .version('0.1.39')
  .description('Virtuin Task Dispatcher runs tasks defined in supplied collection JSON file.');

program
  .command('run <collectionPath>')
  .option('-t, --task <index>', 'Task Index [0-N]', parseInt, 0)
  .option('-g, --group <index>', 'Group Index [0-M]', parseInt, 0)
  .option('-v, --verbose <level>', 'Verbosity [0-2]', parseInt, 0)
  .action((collectionPath, options) => {
    console.log(`run ${collectionPath}`);
    inputCommand = 'run';
    collectionDefPath = collectionPath;
    groupIndex = options.group;
    taskIndex = options.task;
    verbosity = options.verbose;
  });

program
  .command('sendData <collectionPath> ')
  .option('-t, --task <index>', 'Task Index [0-N]', parseInt, 0)
  .option('-g, --group <index>', 'Group Index [0-M]', parseInt, 0)
  .option('-v, --verbose <level>', 'Verbosity [0-2]', parseInt, 0)
  .description('Sends the task data from the collection to an input file located at /virtuin_task.json in the service. Data for other stations will be stripped out.')
  .action((collectionPath, options) => {
    console.log(`sendData ${collectionPath}`);
    inputCommand = 'sendData';
    collectionDefPath = collectionPath;
    groupIndex = options.group;
    taskIndex = options.task;
    verbosity = options.verbose;
  });
program
  .command('up <collectionPath>')
  .option('-r, --reload', 'Reload the entire docker compose specified in the collection', parseInt, 0)
  .option('-v, --verbose <level>', 'Verbosity [0-2]', parseInt, 0)
  .action((collectionPath, options) => {
    console.log(`up ${collectionPath}`);
    inputCommand = 'up';
    collectionDefPath = collectionPath;
    fullReload = options.reload || false;
    verbosity = options.verbose;
  });

program
  .command('upVM <collectionPath>')
  .option('-r, --reload', 'Reload the virtual machine specified in the collection if already running', parseInt, 0)
  .option('-v, --verbose <level>', 'Verbosity [0-2]', parseInt, 0)
  .action((collectionPath, options) => {
    console.log(`run ${collectionPath}`);
    inputCommand = 'upVM';
    collectionDefPath = collectionPath;
    fullReload = options.reload || false;
    verbosity = options.verbose;
  });

program
  .command('down <collectionPath>')
  .option('-v, --verbose <level>', 'Verbosity [0-2]', parseInt, 0)
  .action((collectionPath, options) => {
    console.log(`down ${collectionPath}`);
    inputCommand = 'down';
    collectionDefPath = collectionPath;
    verbosity = options.verbose;
  });

program
  .command('downVM <collectionPath>')
  .option('-v, --verbose <level>', 'Verbosity [0-2]', parseInt, 0)
  .action((collectionPath, options) => {
    console.log(`down ${collectionPath}`);
    inputCommand = 'downVM';
    collectionDefPath = collectionPath;
    verbosity = options.verbose;
  });
// Process passed arguments
program.parse(process.argv);

if ((typeof collectionDefPath !== 'string') || fs.existsSync(collectionDefPath) === false) {
  console.error('Invalid collection definition path provided');
  process.exit(1);
}

if (verbosity > 2 || verbosity < 0) {
  console.error(`Invalid verbosity setting ${verbosity}`);
  process.exit(1);
}


class CommandHandler {
  dispatcher: VirtuinTaskDispatcher;

  verbosity: number;

  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.verbosity = dispatcher.verbosity;
    this.setupDispatcherLogging();
  }

  setupDispatcherLogging() {
    this.dispatcher.on('task-stdout', msg => {
      console.log(`[VIRT:task-stdout] ${msg}`);
    });
    this.dispatcher.on('task-stderr', msg => {
      console.log(`[VIRT:task-stderr] ${msg}`);
    });
    this.dispatcher.on('task-status', (err, status) => {
      if (err) {
        console.log(`[VIRT:error] ${err.message}`);
      } else if (status) {
        console.log(`[VIRT:task-status] ${JSON.stringify(status)}`);
      }
    });
    if (this.verbosity >= 1) {
      this.dispatcher.on('collection-log', msg => {
        console.log(`[VIRT:collection-log] ${msg}`);
      });
      this.dispatcher.on('task-log', msg => {
        console.log(`[VIRT:task-log] ${msg}`);
      });
    }
    if (this.verbosity === 2) {
      this.dispatcher.on('collection-stdout', msg => {
        console.log(`[VIRT:collection-stdout] ${msg}`);
      });
      this.dispatcher.on('collection-stderr', msg => {
        console.log(`[VIRT:collection-stderr] ${msg}`);
      });
    }
  }

  async runTask(group: TaskGroup, task: Task): Promise<void> {
    const taskConfigs = {
      task,
      groupName: group.name
    };
    await this.dispatcher.startTask(taskConfigs, (this.dispatcher.collectionDef.build === 'development'));
    return new Promise(async (resolve) => {
      const updateInterval = setInterval(async () => {
        const status = await dispatcher.getStatus();
        if (status.state === 'FINISHED' || status.state === 'KILLED') {
          clearInterval(updateInterval);
          resolve();
        }
      }, 500);
    });
  }

  async run(group: number, index: number): Promise<void> {
    const tasks = this.dispatcher.collectionDef.taskGroups[group].tasks || [];
    if (index >= 0 && index < tasks.length) {
      const currTask = tasks[index];
      console.log('[VIRT] Task started');
      await this.runTask(this.dispatcher.collectionDef.taskGroups[group], currTask);
      console.log('[VIRT] Task finished');
      console.log('[VIRT] To attach manually in the service run');
      console.log(`[VIRT] docker-compose ${[...this.dispatcher.daemonArgs, 'exec', currTask.dockerInfo.serviceName, 'bash'].join(' ')}`);
    } else {
      throw new Error('[VIRT] Task invalid group/task index');
    }
  }

  async sendData(group: number, index: number): Promise<void> {
    const tasks = this.dispatcher.collectionDef.taskGroups[group].tasks || [];
    if (index >= 0 && index < tasks.length) {
      const currTask = tasks[index];
      console.log('[VIRT] Sending Task data');
      await dispatcher.sendTaskInputDataFile(currTask);
      console.log('[VIRT] Sending Task data finished');
      console.log(`[VIRT] To attach manually and view /virtuin_task.json in the service ${currTask.dockerInfo.serviceName} run`);
      console.log(`[VIRT] docker-compose ${[...this.dispatcher.daemonArgs, 'exec', currTask.dockerInfo.serviceName, 'bash'].join(' ')}`);
    } else {
      throw new Error('[VIRT] Task invalid group/task index');
    }
  }

  async up(reloadCompoase: boolean = false): Promise<void> {
    console.log('[VIRT] bringing docker-compose up');
    await this.dispatcher.up(reloadCompoase, (this.dispatcher.collectionDef.build === 'development'));
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('[VIRT] finished docker-compose up');
    console.log('[VIRT] To attach manually to a service run');
    console.log(`[VIRT] docker-compose ${[...this.dispatcher.daemonArgs, 'exec', '[service-name]', 'bash'].join(' ')}`);
  }

  async down(): Promise<void> {
    console.log('[VIRT] bringing Vagrant VM down');
    await this.dispatcher.down();
    console.log('[VIRT] finished Vagrant VM down');
  }

  async upVM(reloadVM: boolean = false): Promise<void> {
    console.log('[VIRT] Vagrant VM up');
    await this.dispatcher.upVM(reloadVM);
    console.log('[VIRT] finished VM up');
  }

  async downVM(): Promise<void> {
    console.log('[VIRT] bringing Vagrant VM down');
    await this.dispatcher.downVM();
    console.log('[VIRT] finished Vagrant VM down');
  }
}
// Read task sdefinitions file args[2]
if (!process.env.VIRT_STATION_NAME) {
  console.error('VIRT_STATION_NAME environment variable must be globally set on your system');
  process.exit(1);
}
const stationName: string = (process.env.VIRT_STATION_NAME: any);
console.log(`[VIRT] running in ${stationName}`);
const tmpCollectionDef: ?RootInterface = VirtuinTaskDispatcher.collectionObjectFromPath((collectionDefPath: any));

if (!tmpCollectionDef || !tmpCollectionDef.stationCollectionEnvPaths
  || !tmpCollectionDef.stationCollectionEnvPaths[stationName]) {
  console.error('The variable stationCollectionEnvPaths is not set for this station in the collection.');
  console.error(`Please add ${stationName} key with the full path to the .env of this collection`);
  process.exit(1);
}
const collectionDef: RootInterface = (tmpCollectionDef: any);
const collectionEnvPath = collectionDef.stationCollectionEnvPaths[stationName];
if (!collectionEnvPath) {
  console.error(`The path for the collection path collection.env file was not specified for ${stationName}.`);
  process.exit(1);
}

const collectionEnvs: ?CollectionEnvs = VirtuinTaskDispatcher.collectionEnvFromPath(collectionEnvPath);
if (!collectionEnvs) {
  process.exit(1);
}

const stackPath = path.join(os.tmpdir(), 'stacks');
let dispatcher: VirtuinTaskDispatcher;
let commandHandler: CommandHandler;
if (inputCommand === 'run') {
  const d: ProduceRouterDelegate = {
    dispatch: (o): void => {
      console.log(`called dispatch: received ${o.type} for ${o.taskUUID}`);
    },
    dispatchWithResponse: (o): Promise<any> => {
      console.log(`called dispatchWithResponse: received ${o.type} for ${o.taskUUID}`);
      return new Promise((resolve) => {
        resolve(`received ${o.message}`);
      });
    }
  };
  dispatcher = new VirtuinTaskDispatcher(
    stationName,
    collectionEnvPath,
    (collectionEnvs: any),
    collectionDef,
    stackPath,
    verbosity,
    d
  );
  commandHandler = new CommandHandler(dispatcher);
  commandHandler.run(groupIndex, taskIndex).then(() => {
    dispatcher.end();
    return true;
  }).catch(async (err) => {
    console.log(`[VIRT] Task dispatcher received fatal err: ${err}`);
    dispatcher.end();
    process.exit(2);
  });
} else {
  dispatcher = new VirtuinTaskDispatcher(
    stationName,
    collectionEnvPath,
    (collectionEnvs: any),
    collectionDef,
    stackPath,
    verbosity
  );
  commandHandler = new CommandHandler(dispatcher);
  if (inputCommand === 'sendData') {
    commandHandler.sendData(groupIndex, taskIndex).then(() => true).catch(async (err) => {
      console.log(`[VIRT] Task dispatcher received fatal err: ${err}`);
      process.exit(2);
    });
  } else if (inputCommand === 'up') {
    commandHandler.up(fullReload).then(() => true).catch(async (err) => {
      console.log(`[VIRT] Task dispatcher received fatal err: ${err}`);
      process.exit(2);
    });
  } else if (inputCommand === 'down') {
    commandHandler.down().then(() => true).catch(async (err) => {
      console.log(`[VIRT] Task dispatcher received fatal err: ${err}`);
      process.exit(2);
    });
  } else if (inputCommand === 'upVM') {
    commandHandler.upVM(fullReload).then(() => true).catch(async (err) => {
      console.log(`[VIRT] Task dispatcher received fatal err: ${err}`);
      process.exit(2);
    });
  } else if (inputCommand === 'downVM') {
    commandHandler.downVM().then(() => true).catch(async (err) => {
      console.log(`[VIRT] Task dispatcher received fatal err: ${err}`);
      process.exit(2);
    });
  }
}

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('exit', (code) => {
  console.log(`[VIRT] Task dispatcher finished (code=${code}).`);
  if (dispatcher) {
    // dispatcher.cleanup();
  }
});
