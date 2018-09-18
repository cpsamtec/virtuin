
import { UPDATE_TASK_STATUS, CLEAR_TASK_STATUS } from '../types';
import { TaskStatusState, TaskStatusAction } from '../types';

const initialState : TaskStatusState = {
  version: undefined,
  taskUUID: undefined,
  name: undefined,
  state: undefined,
  progress: undefined,
  error: undefined,
  message: undefined
};

export default function taskStatus(
  state: TaskStatusState = initialState,
  action: TaskStatusAction): TaskStatusState {
  switch (action.type) {
    case UPDATE_TASK_STATUS: {
      return { ...state, ...action.payload };
    }
    case CLEAR_TASK_STATUS: {
      return initialState;
    }
    default:
      return state;
  }
}
