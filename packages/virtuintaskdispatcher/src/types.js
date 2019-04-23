import { JestEnvironment } from "@jest/environment";

// @flow

// collection.env
export type CollectionEnvs = {
  VIRT_VAGRANT_DIRECTORY?: string,
  VIRT_DOCKER_HOST: string,
  VIRT_DOCKER_USER?: string,
  VIRT_DOCKER_PASSWORD?: string,
  [string]: string | number
}

type DockerService =  {
  build?: string,
  image?: string,
  command?: string,
  ports?: string[],
  volumes?: string[],
  links?: string[],
  environment?: string[],
};

type DockerServices =  {
  [string]: DockerService,
};
type DockerSource =  {
  version: string,
  services: DockerServices,
};


// collection.json
export type DockerCompose = {
  type?: 'RAW' | 'URL',
  source: DockerSource, // string when type is url
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


export type GroupMode = 'user' | 'managed'; // in managed get rest api to dictate which tasks can be run, in user user can select any
export type TaskGroup = {
  description: string,
  name: string,
  tasks: Task[],
  autoStart: boolean,
  mode: GroupMode
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
