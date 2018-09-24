// @flow

import { createAliasedAction } from 'electron-redux';

import {
  START_TASK_REQUEST,
  STOP_TASK_REQUEST,
} from '../types';



export const startTaskRequest = createAliasedAction(
  START_TASK_REQUEST,
  (groupIndex, taskIndex) => (
    {
      type: START_TASK_REQUEST,
      payload: {groupIndex, taskIndex}
    }
  )
);

export const stopTaskRequest = createAliasedAction(
  STOP_TASK_REQUEST,
  (groupIndex, taskIndex) => (
    {
      type: STOP_TASK_REQUEST,
      payload: {groupIndex, taskIndex}
    }
  )
);
