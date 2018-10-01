// @flow

import { createAliasedAction } from 'electron-redux';
import type { DispatchStatus } from 'virtuintaskdispatcher'
import type { DispatchStatusAction } from '../types'

import {
  UPDATE_STATUS,
} from '../types';



export const updateDispatchStatus = createAliasedAction(
  UPDATE_STATUS,
  (dispatchStatus: {}): DispatchStatusAction => {
  return {
    type: UPDATE_STATUS,
    payload: dispatchStatus
  }
});
