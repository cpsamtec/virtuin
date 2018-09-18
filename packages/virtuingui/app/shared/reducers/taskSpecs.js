
import { SET_TASK_SPECS, CLEAR_TASK_SPECS, TaskSpecsState, TaskSpecsAction } from '../types';

const initialState: TaskSpecsState = {
  specs: []
};

function dut(state: TaskSpecsState = initialState, action: TaskSpecsAction): TaskSpecsState {
  switch (action.type) {
    case SET_TASK_SPECS: {
      return {
        ...state,
        specs: action.payload
      };
    }
    case CLEAR_TASK_SPECS: {
      return {
        ...state,
        specs: []
      };
    }
    default:
      return state;
  }
}

export default dut;
