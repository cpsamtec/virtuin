// @flow

import {
  START_TASK_REQUEST,
  START_TASK_REQUEST_FAILED,
  STOP_TASK_REQUEST,
  STOP_TASK_REQUEST_FAILED,
  SET_TASKS,
  SET_ACTIVE_TASK,
  UPDATE_ACTIVE_TASK,
  SET_ACTIVE_TASK_STATE,
  CLEAR_ACTIVE_TASK,
  TaskState,
  TaskAction
} from '../types';

const initialState: TaskState = {
  tasks: [],
  fetchState: 'IDLE',
  activeTask: undefined,
};

export default function task(state: TaskState = initialState, action: TaskAction): TaskState {
  const { type, payload, error } = action;
  switch (type) {
    case SET_TASKS: {
      if (error) return state;
      const tasks = payload.map(newTask => {
        const oldTask = state.tasks.reduce(
          (previous, current) => (newTask.id === current.id ? current : previous),
          {}
        );
        return {
          // update if already existing
          ...oldTask,
          ...newTask
        };
      });
      return {
        ...state,
        tasks
      };
    }
    case UPDATE_ACTIVE_TASK: {
      return {
        ...state,
        activeTask: { ...state.activeTask, ...payload }
      };
    }
    case SET_ACTIVE_TASK: {
      return {
        ...state,
        activeTask: { ...payload }
      };
    }
    case SET_ACTIVE_TASK_STATE: {
      return {
        ...state,
        activeTask: { ...state.activeTask, state: payload }
      };
    }
    case CLEAR_ACTIVE_TASK: {
      return {
        ...state,
        activeTask: undefined
      };
    }
    case START_TASK_REQUEST: {
      let activeTask = { state: 'START_REQUEST', error: undefined, id: payload, taskUUID: undefined, time: undefined };
      const taskInfo = state.tasks.find((t) => t.id === payload);
      if (taskInfo !== undefined) {
        activeTask = { ...activeTask, name: taskInfo.name };
      }
      return {
        ...state,
        activeTask
      };
    }
    case START_TASK_REQUEST_FAILED: {
      return {
        ...state,
        activeTask: { ...state.activeTask, state: 'KILLED', error: payload.error }
      };
    }
    case STOP_TASK_REQUEST: {
      return {
        ...state,
        activeTask: { ...state.activeTask, state: 'STOP_TASK_REQUEST' }
      };
    }
    case STOP_TASK_REQUEST_FAILED: {
      return {
        ...state,
        activeTask: { ...state.activeTask, state: 'KILLED', error: payload.error }
      };
    }
    default:
      return state;
  }
}
