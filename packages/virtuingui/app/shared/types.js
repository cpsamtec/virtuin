
// Shared reducer/action types
export type BaseAction<T> = {
  type: string,
  payload: T
};

// DUT type definitions
export const SET_DUT: string = 'SET_DUT';
export type DUTActionType = | 'SET_DUT';
export type DUTState = {
  +SerialNumber: ?string,
  +PartNumber: ?string
};
export type SetDUTAction = BaseAction<DUTState>;
export type DUTAction = | SetDUTAction;


// Station type definitions
export const SET_STATION = 'SET_STATION';
export type StationState = {
  +name: string,
  +user: ?string,
  +brokerAddress: string
};
export type StationAction = BaseAction<StationState>;


// Task type definitions
export const START_TASK_REQUEST: string = 'START_TASK_REQUEST';
export const START_TASK_REQUEST_FAILED: string = 'START_TASK_REQUEST_FAILED';
export const STOP_TASK_REQUEST: string = 'STOP_TASK_REQUEST';
export const STOP_TASK_REQUEST_FAILED: string = 'STOP_TASK_REQUEST_FAILED';
export const FETCH_TASKS_REQUEST: string = 'FETCH_TASKS_REQUEST';
export const FETCH_TASKS_REQUEST_FAILED: string = 'FETCH_TASKS_REQUEST_FAILED';
export const START_TASK: string = 'START_TASK';
export const STOP_TASK: string = 'STOP_TASK';
export const SET_TASKS: string = 'SET_TASKS';
export const UPDATE_ACTIVE_TASK: string = 'UPDATE_ACTIVE_TASK';
export const SET_ACTIVE_TASK: string = 'SET_ACTIVE_TASK';
export const SET_ACTIVE_TASK_STATE: string = 'SET_ACTIVE_TASK_STATE';
export const CLEAR_ACTIVE_TASK: string = 'CLEAR_ACTIVE_TASK';
export const CLEAR_FINISHED_TASK_REQUEST: string = 'CLEAR_FINISHED_TASK_REQUEST';

export type TaskCondition = {
  +name: string,
  +units: string,
  +value: string | number | null
};

export type Task = {
  +id: string,
  +name: string,
  +type: string,
  +description: string,
  +specs: Array<TaskSpec>,
  +conditions: Array<TaskCondition>,
  +command: string,
  +vars: Object,
  +viewURL?: string,
  +required: boolean,
  +autoStart: boolean
};

export type ActiveStateType = 'START_REQUEST' | 'START_REQUEST_FAILED' | 'STARTING' | 'RUNNING' | 'STOP_REQUEST' | 'STOP_REQUEST_FAILED' | 'STOPPING' | 'KILLED' | 'FINISHED';
export type ActiveTask = {
  +id: string,
  +state: ActiveStateType,
  +taskUUID?: string,
  +name?: string,
  +time?: Date,
  +error?: string
};
export type FetchStateType = 'IDLE' | 'FETCH_REQUEST' | 'FETCHING' | 'FETCH_REQUEST_FAILED';
export type TaskState = {
  +tasks: Array<Task>,
  +fetchState: FetchStateType,
  +activeTask: ?ActiveTask
};

export type TaskAction =
  | BaseAction<Array<Task>>
  | BaseAction<ActiveTask>
  | BaseAction<ActiveStateType>
  | BaseAction<?Object>;


// Task Result type definitions
export const ADD_TASK_RESULT: string = 'ADD_TASK_RESULT';
export const CLEAR_TASK_RESULTS: string = 'CLEAR_TASK_RESULTS';
export type TaskResultsState = {
  +autoIncrementId: number,
  +results: Array<Object>
};

export type TaskResultsAction =
  | BaseAction<TaskResults>
  | BaseAction<?Object>;


// Log Entries
export type LogType = {
  +id: number,
  +type: string,
  +data: string,
  +timestamp: string
};
export const ADD_LOG_ENTRY: string = 'ADD_LOG_ENTRY';
export const CLEAR_LOGS: string = 'CLEAR_LOGS';
export type LogState = {
  +autoIncrementId: number,
  +logs: Array<LogType>
};
export type LogAction =
  | BaseAction<LogType>
  | BaseAction<?Object>;


// Task Status type defintions
export const UPDATE_TASK_STATUS = 'UPDATE_TASK_STATUS';
export const CLEAR_TASK_STATUS = 'CLEAR_TASK_STATUS';
export type TaskStatusState = {
  +version: ?string,
  +taskUUID: ?string,
  +name: ?string,
  +state: ?string,
  +progress: ?number,
  +passed: ?boolean,
  +error?: ?string,
  +message?: ?string
};
export type TaskStatusAction =
  | BaseAction<TaskStatusState>
  | BaseAction<?Object>;

export const SET_TASK_SPECS = 'SET_TASK_SPECS';
export const CLEAR_TASK_SPECS = 'CLEAR_TASK_SPECS';

export type TaskSpec = {
  +name: string,
  +units: string,
  +lsl: number,
  +usl: number,
  +evaluation: string,
  +counts: boolean,
  +details?: ?string
};

export type TaskSpecsState = {
  +specs: Array<TaskSpec>
};

export type TaskSpecsAction =
  | BaseAction<?Object>;

export type StackDefintion = {
  +type: string,
  +source: string
};
