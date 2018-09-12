// @flow

// collection.env
export type CollectionEnvs = {
  VIRT_VAGRANT_DIRECTORY: string,
  VIRT_BROKER_ADDRESS: string,
  VIRT_DOCKER_HOST: string,
  VIRT_DOCKER_USER?: string,
  VIRT_DOCKER_PASSWORD?: string,
  [string]: string | number
}

// collection.json
export type DockerCompose = {
  type?: 'RAW' | 'URL',
  source: ({version: string} & Object) | string, // string when type is url
};

export type DockerInfo = {
  args: string[],
  command: string,
  serviceName: string,
  type: string,
};

export type TaskData = {
  virt_stations: {[string]: Object}, /* key: string is the virtuin name of a station. The object value is data speceific to the corresponding station */
} & Object;

export type RootInterface = {
  build: 'development' | 'release',
  collectionName: string,
  collectionTag: string,
  dockerCompose: DockerCompose,
  stationCollectionEnvPaths: StationCollectionEnvPaths,
  taskGroups: TaskGroup[],
};

// collection.env paths for eatch station
export type StationCollectionEnvPaths = {
  [string]: string, /* key: string is the virtuin name of a station. The value is that statoin's full path to its collection.env */
};


export type TaskGroup = {
  description: string,
  name: string,
  runType: 'manual' | 'automatic',
  tasks: Task[],
  type: 'GENERIC' | 'TEST',
};

export type Task = {
  autoStart: boolean,
  description: string,
  dockerInfo: DockerInfo,
  data: TaskData,
  name: string,
  specs?: any,
  viewURL?: string,
};
