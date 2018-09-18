// @flow
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import taskConfigs from './taskConfigs';
import taskControls from './taskControls';
import taskResults from './taskResults';
import taskStatus from './taskStatus';
import log from './log';
import task from './task';
import station from './station';
import dut from './dut';
import taskSpecs from './taskSpecs';

type scopeType = 'main' | 'renderer';

export default function getRootReducer(scope: scopeType = 'main') {
  let reducers = {
    dut,
    taskConfigs,
    taskControls,
    taskResults,
    taskStatus,
    taskSpecs,
    task,
    station,
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
