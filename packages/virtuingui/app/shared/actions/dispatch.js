// @flow

import { createAliasedAction } from 'electron-redux';
import type { DispatchStatus } from 'virtuintaskdispatcher'
import type { DispatchStatusAction, DispatchErrorAction } from '../types'

import {
  UPDATE_STATUS,
  UPDATE_ERROR
} from '../types';



export const updateDispatchStatus = createAliasedAction(
  UPDATE_STATUS,
  (dispatchStatus: {}): DispatchStatusAction => {
  return {
    type: UPDATE_STATUS,
    payload: dispatchStatus
  }
});

export const updateError = createAliasedAction(
  UPDATE_ERROR,
  (error: ""): DispatchErrorAction => {
  return {
    type: UPDATE_ERROR,
    payload: error
  }
});
