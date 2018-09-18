import { SET_TASK_SPECS, CLEAR_TASK_SPECS } from '../types';

export function setTaskSpecs(specs: []) {
  return {
    type: SET_TASK_SPECS,
    payload: [...specs]
  };
}

export function clearTaskSpecs() {
  return {
    type: CLEAR_TASK_SPECS,
    payload: undefined
  };
}
