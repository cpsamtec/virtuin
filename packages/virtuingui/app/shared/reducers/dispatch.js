// @flow

import type {
  DispatchStatusAction,
  DispatchErrorAction,
  DispatchErrorStatus,
} from '../types';
import {
  UPDATE_STATUS,
  UPDATE_ERROR,
} from '../types';
const { VirtuinTaskDispatcher } = require('virtuintaskdispatcher').VirtuinTaskDispatcher;
import type { DispatchStatus } from 'virtuintaskdispatcher';

export default function dispatchStatus(state: DispatchStatus = VirtuinTaskDispatcher.genInitDispatchStatus(), action: DispatchStatusAction): DispatchStatus {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_STATUS: {
      return {
        ...state,
        ...payload
      };
    }
    default:
      return state;
  }
}

export function dispatchError(state: DispatchErrorStatus = {message: ""}, action: DispatchErrorAction): DispatchErrorStatus {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_ERROR:
      return {
        ...state,
        ...payload
      };
    default:
      console.log(`state is ${state} ${typeof state}`);
      return state;
  }
}
