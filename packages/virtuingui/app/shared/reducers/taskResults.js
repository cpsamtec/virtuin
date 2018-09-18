// @flow
import {ADD_TASK_RESULT, CLEAR_TASK_RESULTS, TaskResultsState, TaskResultsAction} from '../types';

const initialState: TaskResultsState = {
  autoIncrementId: 1,
  results: []
};

export default function taskResults(state: TaskResultsState = initialState, action: TaskResultsAction): TaskResultsState {
  switch (action.type) {
    case ADD_TASK_RESULT: {
      return {
        ...state,
        results: [
          ...state.results,
          {
            ...action.payload,
            id: state.autoIncrementId
          }
        ],
        autoIncrementId: state.autoIncrementId + 1
      };
    }
    case CLEAR_TASK_RESULTS: {
      return {
        ...state,
        results: [],
        autoIncrementId: 1
      };
    }
    default:
      return state;
  }
}
