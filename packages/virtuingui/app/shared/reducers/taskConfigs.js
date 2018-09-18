
import { SET_TASK_CONFIGS, UPDATE_TASK_CONFIGS } from '../actions/taskConfigs';

const initialState = {};

export default function taskConfigs(state = initialState, action) {
  switch (action.type) {
    case SET_TASK_CONFIGS: {
      return action.payload;
    }
    case UPDATE_TASK_CONFIGS: {
      const newVal = {};
      Object.assign(newVal, state);
      newVal.dut[action.payload.parameter] = action.payload.value;
      return newVal;
    }
    default:
      return state;
  }
}
