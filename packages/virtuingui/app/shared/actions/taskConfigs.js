export const SET_TASK_CONFIGS = 'SET_TASK_CONFIGS';
export const UPDATE_TASK_CONFIGS = 'UPDATE_TASK_CONFIGS';

export function setTaskConfigs(taskConfigs: {}) {
  return {
    type: SET_TASK_CONFIGS,
    payload: {
      ...taskConfigs,
    }
  };
}

export function updateTaskConfigs(parameter, value) {
  return {
    type: UPDATE_TASK_CONFIGS,
    payload: {
      parameter,
      value,
    }
  };
}
