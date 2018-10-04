// @flow

import {
  DispatchStatusAction,
  DispatchErrorAction,
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

export function dispatchError(state: string = "", action: DispatchErrorAction): string {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_ERROR: {
        payload
    }
    default:
      return state;
  }
}
