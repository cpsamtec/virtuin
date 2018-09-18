import { ADD_TASK_RESULT, CLEAR_TASK_RESULTS } from '../types';

export function addTaskResult(result: {}) {
  return {
    type: ADD_TASK_RESULT,
    payload: { ...result }
  };
}

export function clearTaskResults() {
  return {
    type: CLEAR_TASK_RESULTS,
    payload: undefined
  };
}
