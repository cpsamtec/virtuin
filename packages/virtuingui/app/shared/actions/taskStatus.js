import { UPDATE_TASK_STATUS, CLEAR_TASK_STATUS } from '../types';

export function updateTaskStatus(taskStatus: {}) {
  return {
    type: UPDATE_TASK_STATUS,
    payload: { ...taskStatus }
  };
}

export function clearTaskStatus() {
  return {
    type: CLEAR_TASK_STATUS,
    payload: undefined
  };
}
