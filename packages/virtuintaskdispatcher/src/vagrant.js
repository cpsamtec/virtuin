/* @flow */
const util = require('util');
const EventEmitter = require('events');
const exec = util.promisify(require('child_process').exec);

const delay = util.promisify(setTimeout);

class VagrantEmitter extends EventEmitter {}

export const vagrantEmitter = new VagrantEmitter();

type VagrantStatus = 'running' | 'poweroff' | 'not running' | 'not created' | 'saved';
type VagrantMachineInfo = {
  id: string,
  name: string,
  provider: string,
  state: VagrantStatus,
  cwd: string
}
export async function vagrantGlobalStatus(): Promise<Array<VagrantMachineInfo>> {
  const machines: Array<VagrantMachineInfo> = [];
  try {
    const { stdout } = await exec('vagrant global-status --prune');
    let lines = stdout.toString().split('\n').slice(2).reduce((prev, curr) => {
      if (prev.length > 0 && prev[prev.length - 1].length === 0) {
        return prev;
      }
      prev.push(curr.trim());
      return prev;
    }, []);

    lines.pop();
    if (/no active Vagrant environments/.test(lines[0])) {
      lines = [];
    }

    const re = /(\S+)\s+(\S+)\s+(\S+)\s+(not\srunning|not\screated|\S+)\s+(\S+)/;
    return lines.map(line => {
      const res = line.match(re);
      vagrantEmitter.emit('vagrant-status', `${res}`);
      return ({
        id: res[1],
        name: res[2],
        provider: res[3],
        state: res[4],
        cwd: res[5]
      });
    });
  } catch (error) {
    vagrantEmitter.emit('vagrant-error', 'Error reading vagrant status');
  }
  return machines;
}
export async function vagrantStopVMInDirectory(directory: string): Promise<boolean> {
  try {
    // const { stdout, stderr } =
    await exec('vagrant halt', { cwd: directory });
    await delay(5000); // Make sure machine is fully shut down
    vagrantEmitter.emit('vagrant-status', `stopped in ${directory}`);
    return true;
  } catch (error) {
    try {
      vagrantEmitter.emit('vagrant-error', `Vagrant could not stop in ${directory} -- forcing`);
      await exec('vagrant halt -f', { cwd: directory });
      return true;
    } catch (e) {
      vagrantEmitter.emit('vagrant-error', `Vagrant could not stop in ${directory} -- error ${e}`);
      return false;
    }
  }
}
export async function vagrantStopMachine(machine: VagrantMachineInfo) {
  try {
    // const { stdout, stderr } =
    await exec(`vagrant halt ${machine.id}`);
    await delay(5000); // Make sure machine is fully shut down
    vagrantEmitter.emit('vagrant-status', `stopped ${machine.name}`);
  } catch (error) {
    try {
      vagrantEmitter.emit('vagrant-error', `Vagrant could not stop ${machine.name} at ${machine.cwd} -- forcing`);
      await exec(`vagrant halt -f ${machine.id}`);
    } catch (e) {
      vagrantEmitter.emit('vagrant-error', `Vagrant could not stop ${machine.name} at ${machine.cwd} -- error ${e}`);
      throw Error(`Vagrant could not stop ${machine.name} at ${machine.cwd} -- error ${e}`);
    }
  }
}
export async function vagrantStartMachine(machine: VagrantMachineInfo) {
  try {
    /* const { stdout, stderr } = */
    await exec(`vagrant up ${machine.id}`);
    vagrantEmitter.emit('vagrant-status', 'started ', machine.name);
  } catch (error) {
    vagrantEmitter.emit('vagrant-error', `Vagrant could not start ${machine.name} at ${machine.cwd} -- error ${error}`);
    throw Error(`Vagrant could not start ${machine.name} at ${machine.cwd} -- error ${error}`);
  }
}
export async function ensureOnlyMachineRunningAtDirectory(directory: string, fullReload: boolean = false, statusCallback: ?((string) => void) = null) {
  try {
    const machines = await vagrantGlobalStatus();
    const index = machines.findIndex(machine => machine.cwd === directory);
    for (const i of machines.keys()) {
      if (fullReload === false && i === index) {
        // Not force reloading i.e stopping and starting so continue
        continue;
      }
      statusCallback && statusCallback(`checking ${machines[i].name} state: ${machines[i].state}`);
      // If forceReload on index or current machine is not powered off
      if (i === index || machines[i].state === 'running') {
        statusCallback && statusCallback(`[~10 s] stopping ${machines[i].name}`);
        await vagrantStopMachine(machines[i]);
      }
    }
    // index < 0, never started before or destroyed, so bring it up
    if (index < 0 || machines[index].state !== 'running') {
      if (index < 0) {
        statusCallback && statusCallback(`[~10 min] starting new machine at ${directory}`);
        /* const { stdout, stderr } = */
        await exec('vagrant up',
          { cwd: directory });
      } else {
        statusCallback && statusCallback(`[~3 min] starting ${machines[index].name}`);
        await vagrantStartMachine(machines[index]);
      }
      statusCallback && statusCallback('[~5 s] finishing up');
      await delay(5000); // Make sure machine is fully running
    }
    statusCallback && statusCallback('[~0 s] complete');
    // console.log('stderr:', stderr);
  } catch (error) {
    statusCallback && statusCallback(`[~0 s] Vagrant Error\n${error}`);
    throw error;
  }
}
// ensureOnlyMachineRunningAtDirectory('/home/chris/Documents/Samtec/Virtuin/ProcessExample/vm');
// ensureOnlyMachineRunningAtDirectory('/home/chris/Documents/Samtec/virtuinMachine');
