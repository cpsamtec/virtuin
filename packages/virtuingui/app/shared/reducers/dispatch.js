// @flow

import {
  DispatchStatusAction,
  UPDATE_STATUS,
} from '../types';
const { VirtuinTaskDispatcher } = require('virtuintaskdispatcher').VirtuinTaskDispatcher;
import type { DispatchStatus } from 'virtuintaskdispatcher';

export default function dispatchStatus(state: DispatchStatus = VirtuinTaskDispatcher.genInitDispatchStatus(), action: DispatchStatusAction): DispatchStatus {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_STATUS: {
    debugger;
      return {
        ...state,
        ...payload
      };
    }
    default:
      return state;
  }
}
