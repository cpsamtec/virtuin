// @flow

// import * as os from 'os';
// import * as path from 'path';
// import * as fs from 'fs';
// import * as dotenv from 'dotenv';
import type { RootInterface, CollectionEnvs } from 'virtuintaskdispatcher/distribution/types';
// import type { ProduceRouterDelegate } from './VirtuinTaskDispatcher';
import type { DispatchUpdatePrimaryStatus, DispatchStatus } from 'virtuintaskdispatcher';
const os = require('os');
const path = require('path');
const fs = require('fs');
const program = require('commander');
const ospath = require('ospath');
const readline = require('readline-promise').default;
const url = require('url');

const { VirtuinTaskDispatcher } = require('virtuintaskdispatcher').VirtuinTaskDispatcher;

type InputCommandType = 'run' | 'up' | 'down' | 'sendTaskInputFile'

// import VirtuinTaskDispatcher from './VirtuinTaskDispatcher';
// Define required arguments
let inputCommand: InputCommandType = 'run';
let collectionDefUrl: URL;
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
  .action((collectionPath, options) => {
    console.log(`run ${collectionPath}`);
    inputCommand = 'run';
    try {
      collectionDefUrl = url.pathToFileURL(collectionPath);
    } catch(error) {
      collectionDefUrl = new URL(collectionPath);
    }
    groupIndex = options.group;
    taskIndex = options.task;
    verbosity = options.verbose;
  });

program
  .command('getRunningLocation')
  .action((options) => {
    const appDataPath = ospath.data();
    const stackPath = path.join(appDataPath, 'Virtuin');
    if (!fs.existsSync(stackPath)){
      fs.mkdirSync(stackPath);
    }
    console.log(`Running docker location of collections can be found at ${stackPath}`);
    process.exit(0)
  });

program
  .command('sendTaskInputFile <collectionPath> ')
  .option('-t, --task <index>', 'Task Index [0-N]', parseInt, 0)
  .option('-g, --group <index>', 'Group Index [0-M]', parseInt, 0)
  .option('-v, --verbose <level>', 'Verbosity [0-2]', parseInt, 0)
  .description('Sends the task data from the collection to an input file located at /virtuin_task.json in the service. Data for other stations will be stripped out.')
  .action((collectionPath, options) => {
    console.log(`sendTaskInputFile ${collectionPath}`);
    inputCommand = 'sendTaskInputFile';
    try {
      collectionDefUrl = url.pathToFileURL(collectionPath);
    } catch(error) {
      collectionDefUrl = new URL(collectionPath);
    }
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
    try {
      collectionDefUrl = url.pathToFileURL(collectionPath);
    } catch(error) {
      collectionDefUrl = new URL(collectionPath);
    }
    fullReload = options.reload || false;
    verbosity = options.verbose;
  });


program
  .command('down <collectionPath>')
  .option('-v, --verbose <level>', 'Verbosity [0-2]', parseInt, 0)
  .action((collectionPath, options) => {
    console.log(`down ${collectionPath}`);
    inputCommand = 'down';
    try {
      collectionDefUrl = url.pathToFileURL(collectionPath);
    } catch(error) {
      collectionDefUrl = new URL(collectionPath);
    }
    verbosity = options.verbose;
  });

// Process passed arguments
program.parse(process.argv);

if (verbosity > 2 || verbosity < 0) {
  console.error(`Invalid verbosity setting ${verbosity}`);
  process.exit(1);
}


class CommandHandler {
  dispatcher: VirtuinTaskDispatcher;
  verbosity: number;
  finishedMessages: Array<string>
  promptMessage: ?string

  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.verbosity = dispatcher.verbosity;
    this.finishedMessages = [];
    this.dispatcher.promptHandler = this.promptHandler;
    this.setupDispatcherLogging();
  }

  JSONstringify = (json: string) => {
    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    var
      arr = [],
      _string = '\x1b[92m', //'color:green',
      _number = '\x1b[33m', //'color:darkorange',
      _boolean = '\x1b[34m', //'color:blue',
      _null = '\x1b[95m', //'color:magenta',
      _key = '\x1b[91m'; //'color:red';

    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var style = _number;
      if (/^"/.test(match)) {
          if (/:$/.test(match)) {
              style = _key;
          } else {
              style = _string;
          }
      } else if (/true|false/.test(match)) {
          style = _boolean;
      } else if (/null/.test(match)) {
          style = _null;
      }
      return `${style}${match}\x1b[39m`;
    });
  }
  promptHandler = async ({ promptType, message } : {promptType: string, message: string}): Promise<string> => {
    this.promptMessage = message;
    if (promptType === 'confirmation') {
      this.promptMessage += "\nType okay then press enter\n"
      const rlp = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
      });
      let value = await rlp.questionAsync(this.promptMessage);
      this.promptMessage = null;
      return "okay"
    } else if (promptType === 'confirmCancel') {
      this.promptMessage += "\nType okay|cancel then press enter\n"
      const rlp = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
      });
      let value = await rlp.questionAsync(this.promptMessage);
      value = value.toLowerCase();
      this.promptMessage = null;
      if(value.length > 0 && value[0] === 'o') {
        return "okay"
      }
      return "cancel"
    } else if (promptType === 'text') {
      this.promptMessage += "\nInput text then press enter\n"
      const rlp = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
      });
      let value = await rlp.questionAsync(this.promptMessage);
      this.promptMessage = null;
      return value
    } else {
      throw Error('Invalid prompt type');
    }
  }

  clearConsole = function (options : {toStart: boolean} = {toStart: false}) {
    //process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
    process.stdout.write('\u001b[2J')
    process.stdout.write('\u001b[1;1H')
    if (options && options.toStart) process.stdout.write('\u001b[3J')
  }
  printStatus = function (status: DispatchStatus) {
    this.clearConsole();
    const t = this.JSONstringify(JSON.stringify(status, undefined, 2));
    console.log(`[VIRT:status]\n\n${t}`);
    if(this.promptMessage) {
      console.log(this.promptMessage);
    }
  }
  setupDispatcherLogging() {
    this.clearConsole();
    this.dispatcher.on('task-status', status => {
      this.printStatus(status)
    });
  }


  async run(group: number, index: number): Promise<void> {
    const tasks = this.dispatcher.collectionDef.taskGroups[group].tasks || [];
    if (index >= 0 && index < tasks.length) {
      const currTask = tasks[index];
      console.log('[VIRT] Task started');
      await this.dispatcher.startTask({groupIndex: group, taskIndex: index});
      this.finishedMessages = [
      '[VIRT] Task finished',
      '[VIRT] To attach manually in the service run',
      `[VIRT] docker-compose ${[...this.dispatcher.daemonArgs, 'exec', currTask.dockerInfo.serviceName, 'bash'].join(' ')}`
    ];
    } else {
      throw new Error('[VIRT] Task invalid group/task index');
    }
  }

  async sendTaskInputFile(group: number, index: number): Promise<void> {
    const tasks = this.dispatcher.collectionDef.taskGroups[group].tasks || [];
    if (index >= 0 && index < tasks.length) {
      const currTask = tasks[index];
      console.log('[VIRT] Sending Task data');
      await dispatcher.sendTaskInputDataFile({groupIndex: group, taskIndex: index});
      this.finishedMessages = [
        '[VIRT] Sending Task data finished',
        `[VIRT] To attach manually and view /virtuin_task.json in the service ${currTask.dockerInfo.serviceName} run`,
        `[VIRT] docker-compose ${[...this.dispatcher.daemonArgs, 'exec', currTask.dockerInfo.serviceName, 'bash'].join(' ')}`
      ];
    } else {
      throw new Error('[VIRT] Task invalid group/task index');
    }
  }

  async up(reloadCompoase: boolean = false): Promise<void> {
    console.log('[VIRT] bringing docker-compose up');
    await this.dispatcher.up(reloadCompoase, (this.dispatcher.collectionDef.build === 'development'));
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.finishedMessages = [
      '[VIRT] finished docker-compose up',
      '[VIRT] To attach manually to a service run',
      `[VIRT] docker-compose ${[...this.dispatcher.daemonArgs, 'exec', '[service-name]', 'bash'].join(' ')}`
    ];
  }

  async down(): Promise<void> {
    console.log('[VIRT] bringing containers down');
    await this.dispatcher.down();
    this.finishedMessages = ['[VIRT] finished dispatcher down'];
  }
}
// Read task sdefinitions file args[2]
if (!process.env.VIRT_STATION_NAME) {
  console.log('It is recommended to have VIRT_STATION_NAME environment variable set globally on your system');
  console.log('Will default to VIRT_DEFAULT_STATION')
}
const stationName: string = process.env.VIRT_STATION_NAME || "VIRT_DEFAULT_STATION";
console.log(`[VIRT] running in ${stationName}`);

const newDispatcher = async () : Promise<VirtuinTaskDispatcher> => {
  const tmpCollectionDef: ?RootInterface = await VirtuinTaskDispatcher.collectionObjectFromUrl(collectionDefUrl);
  if (!tmpCollectionDef) {
    console.error('Could not open the collection file');
    process.exit(1);
  }
  const collectionDef: RootInterface = (tmpCollectionDef: any);
  const { collectionEnvPath, collectionEnvs } = await VirtuinTaskDispatcher.collectionEnvFromDefinition(collectionDefUrl, collectionDef);

  const appDataPath = ospath.data();
  const stackPath = path.join(appDataPath, 'virtuin');
  if (!fs.existsSync(stackPath)){
    fs.mkdirSync(stackPath);
  }
  const dispatcher: VirtuinTaskDispatcher = new VirtuinTaskDispatcher(
      stationName,
      collectionDef,
      (collectionEnvs: any),
      collectionEnvPath,
      stackPath,
      verbosity,
    );

    return dispatcher;
}
newDispatcher().then((dispatcher: VirtuinTaskDispatcher) => {
  const commandHandler: CommandHandler = new CommandHandler(dispatcher);
  if (inputCommand === 'run') {
    commandHandler.run(groupIndex, taskIndex).then(() => {
      console.log('When finished Ctrl-c to quit');
      return true;
    }).catch(async (err) => {
      console.log(`[VIRT] Task dispatcher received fatal err: ${err}`);
      dispatcher.end();
      process.exit(2);
    });
  } else if (inputCommand === 'sendTaskInputFile') {
    commandHandler.sendTaskInputFile(groupIndex, taskIndex).then(() => {
      dispatcher.end();
      return true;
    }).catch(async (err) => {
      console.log(`[VIRT] Task dispatcher received fatal err: ${err}`);
      dispatcher.end();
      process.exit(2);
    });
  } else if (inputCommand === 'up') {
    commandHandler.up(fullReload).then(() => {
      dispatcher.end();
      return true;
    }).catch(async (err) => {
      console.log(`[VIRT] Task dispatcher received fatal err: ${err}`);
      dispatcher.end();
      process.exit(2);
    });
  } else if (inputCommand === 'down') {
    commandHandler.down().then(() => {
      dispatcher.end();
      return true;
    }).catch(async (err) => {
      console.log(`[VIRT] Task dispatcher received fatal err: ${err}`);
      dispatcher.end();
      process.exit(2);
    });
  }
  process.on('SIGINT', () => {
    process.exit(0);
  });

  process.on('exit', (code) => {
    console.log(`[VIRT] Task dispatcher finished (code=${code}).`);
    if (commandHandler) {
      for(const k of commandHandler.finishedMessages.keys()) {
        console.log(commandHandler.finishedMessages[k]);
      }
    }
    if (dispatcher) {
      dispatcher.end();
    }
  });
}).catch((error) => {
    console.log(`[VIRT] Task dispatcher received fatal err: ${error}`);
    process.exit(3);
});

