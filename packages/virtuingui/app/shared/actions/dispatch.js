// @flow

import { createAliasedAction } from 'electron-redux';
import type { DispatchStatus } from 'virtuintaskdispatcher'
import type { DispatchStatusAction } from '../types'

import {
  UPDATE_STATUS,
} from '../types';



export function updateDispatchStatus(dispatchStatus: $Shape<DispatchStatus> = {}): DispatchStatusAction {
  return {
    type: UPDATE_STATUS,
    payload: dispatchStatus
  }
}
