// @flow

import { createAliasedAction } from 'electron-redux';

import {
  START_TASK_REQUEST,
  START_TASK_REQUEST_FAILED,
  STOP_TASK_REQUEST,
  STOP_TASK_REQUEST_FAILED,
  FETCH_TASKS_REQUEST,
  FETCH_TASKS_REQUEST_FAILED,
  SET_TASKS,
  UPDATE_ACTIVE_TASK,
  SET_ACTIVE_TASK,
  SET_ACTIVE_TASK_STATE,
  CLEAR_FINISHED_TASK_REQUEST,
  Task,
  ActiveTask,
  ActiveStateType
} from '../types';


export const fetchTasksRequest = createAliasedAction(
  FETCH_TASKS_REQUEST,
  (accessToken) => (
    {
      type: FETCH_TASKS_REQUEST,
      payload: accessToken
    }
  )
);

export const startTaskRequest = createAliasedAction(
  START_TASK_REQUEST,
  (id) => (
    {
      type: START_TASK_REQUEST,
      payload: id
    }
  )
);

export const stopTaskRequest = createAliasedAction(
  STOP_TASK_REQUEST,
  (taskUUID) => (
    {
      type: STOP_TASK_REQUEST,
      payload: taskUUID
    }
  )
);

export const clearFinishedTaskRequest = createAliasedAction(
  CLEAR_FINISHED_TASK_REQUEST,
  (taskUUID) => (
    {
      type: CLEAR_FINISHED_TASK_REQUEST,
      payload: taskUUID
    }
  )
);


export function setTasks(tasks: Array<Task>) {
  return {
    type: SET_TASKS,
    payload: tasks
  };
}

export function setActiveTask(activeTask: ActiveTask) {
  return {
    type: SET_ACTIVE_TASK,
    payload: { ...activeTask }
  };
}

export function updateActiveTask(activeTask: ActiveTask) {
  return {
    type: UPDATE_ACTIVE_TASK,
    payload: { ...activeTask }
  };
}

export function setActiveTaskState(activeTaskState: ActiveStateType) {
  return {
    type: SET_ACTIVE_TASK_STATE,
    payload: activeTaskState
  };
}

export function startTaskRequestFailed(err: string) {
  return {
    type: START_TASK_REQUEST_FAILED,
    payload: { error: err }
  };
}

export function stopTaskRequestFailed(err: string) {
  return {
    type: STOP_TASK_REQUEST_FAILED,
    payload: { error: err }
  };
}

export function fetchTasksRequestFailed(err: string) {
  return {
    type: FETCH_TASKS_REQUEST_FAILED,
    payload: { error: err }
  };
}
