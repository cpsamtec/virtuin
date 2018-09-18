// @flow
import { ADD_LOG_ENTRY, CLEAR_LOGS, LogState, LogAction } from '../types';

const initialState: LogState = {
  autoIncrementId: 1,
  logs: []
};

export default function log(state: LogState = initialState, action: LogAction): LogState {
  switch (action.type) {
    case ADD_LOG_ENTRY: {
      return {
        ...state,
        logs: [
          ...state.logs,
          {
            ...action.payload,
            id: state.autoIncrementId
          }
        ],
        autoIncrementId: state.autoIncrementId + 1
      };
    }
    case CLEAR_LOGS: {
      return {
        ...state,
        logs: [],
        autoIncrementId: 1
      };
    }
    default:
      return state;
  }
}
