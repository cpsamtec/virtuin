
import type { DispatchStatus } from 'virtuintaskdispatcher';
// Shared reducer/action types
export type BaseAction<T> = {
  type: string,
  payload: T
};

// DUT type definitions


// Station type definitions
export const SET_STATION = 'SET_STATION';


// Task type definitions
export const START_TASK_REQUEST: string = 'START_TASK_REQUEST';
export const STOP_TASK_REQUEST: string = 'STOP_TASK_REQUEST';
export const UPDATE_STATUS: string = 'UPDATE_STATUS';

export type DispatchStatusAction = {
  type: 'UPDATE_STATUS',
  payload: $Shape<DispatchStatus>
}

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
export const CLEAR_TASK_STATUS = 'CLEAR_TASK_STATUS';

export type StackDefintion = {
  +type: string,
  +source: string
};
