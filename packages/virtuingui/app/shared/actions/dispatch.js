// @flow

import { createAliasedAction } from 'electron-redux';
import type { DispatchStatus } from 'virtuintaskdispatcher'

import {
  UPDATE_STATUS,
} from '../types';



export const updateDispatchStatus = createAliasedAction(
  UPDATE_STATUS,
  (dispatchStatus: $Shape<DispatchStatus>) => (
    {
      type: UPDATE_STATUS,
      payload: dispatchStatus
    }
  )
);
