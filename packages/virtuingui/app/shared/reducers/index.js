// @flow
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import log from './log';
import dispatchStatus from './dispatch';

type scopeType = 'main' | 'renderer';

export default function getRootReducer(scope: scopeType = 'main') {
  let reducers = {
    dispatchStatus,
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
