// @flow
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import log from './log';
import dispatchStatus, { dispatchError } from './dispatch';

type scopeType = 'main' | 'renderer';

export default function getRootReducer(scope: scopeType = 'main') {
  let reducers = {
    dispatchStatus,
    dispatchError,
    log
  };

  if (scope === 'renderer') {
    reducers = {
      ...reducers,
      routing,
    };
  }
  return combineReducers({ ...reducers });
}
