// @flow

import {
  START_TASK_REQUEST,
  STOP_TASK_REQUEST,
  DispatchStatusAction,
} from '../types';
import { VirtuinTaskDispatcher } from 'virtuintaskdispatcher';
import type { DispatchStatus } from 'virtuintaskdispatcher';


export default function dispatchStatus(state: DispatchStatus = VirtuinTaskDispatcher.getInitDispatchStatus(), action: DispatchStatusAction): DispatchStatus {
  const { type, payload } = action;
  switch (type) {
    case 'UPDATE_STATUS': {
      return {
        ...state,
        ...payload
      };
    }
    default:
      return state;
  }
}
