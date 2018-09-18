
import { TOGGLE_RUN_TASK } from '../actions/taskControls';

const initialState = {
  runTask: true,
  isFetchingTask: false,
};

export default function taskControls(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_RUN_TASK: {
      return {
        ...state,
        runTask: !state.runTask,
      };
    }
    default:
      return state;
  }
}
