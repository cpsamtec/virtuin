import { put, takeEvery } from 'redux-saga/effects';
import { sharedTaskController } from '../../main/TaskController';
import {
  setTasks,
  setActiveTask,
  updateActiveTask,
  fetchTasksRequestFailed,
  startTaskRequestFailed,
  stopTaskRequestFailed } from '../actions/task';
import {
    setTaskSpecs
} from '../actions/taskSpecs';
import { addLogEntry } from '../actions/log';
import { clearTaskStatus } from '../actions/taskStatus';
import { clearTaskResults } from '../actions/taskResults';
import {
  FETCH_TASKS_REQUEST,
  START_TASK_REQUEST,
  STOP_TASK_REQUEST,
  CLEAR_FINISHED_TASK_REQUEST } from '../types';

function* startTaskRequest(action) {
  try {
    const actTask = yield sharedTaskController.reqStartTask(action.payload);
    yield put(clearTaskStatus());
    yield put(clearTaskResults());
    yield put(setActiveTask(actTask));
    const specs = Object.keys(actTask.specs).map(specName =>
      ({ name: specName, ...actTask.specs[specName] }));
    yield put(setTaskSpecs(specs));
    yield put(addLogEntry({ type: 'success', data: `Successfully started task w/ UUID: ${actTask.taskUUID}.` }));
  } catch (err) {
    yield put(startTaskRequestFailed(err));
    yield put(addLogEntry({ type: 'error', data: `Failed starting task w/ error: ${JSON.stringify(err, null, 2)}.` }));
  }
}

function* stopTaskRequest(action) {
  try {
    const actTask = yield sharedTaskController.reqStopTask(action.payload);
    yield put(updateActiveTask(actTask));
    yield put(addLogEntry({ type: 'success', data: 'Successfully killed task.' }));
  } catch (err) {
    yield put(stopTaskRequestFailed(err));
    yield put(addLogEntry({ type: 'error', data: `Failed killing task w/ error: ${JSON.stringify(err, null, 2)}.` }));
  }
}

function* fetchTasksRequest(action) {
  try {
    const tasks = yield sharedTaskController.reqFetchTasks(action.payload);
    yield put(addLogEntry({ type: 'data', data: 'Successfully fetched tasks.' }));
    yield put(setTasks(tasks));
  } catch (err) {
    yield put(fetchTasksRequestFailed(err));
    yield put(addLogEntry({ type: 'error', data: `Failed fetching tasks w/ error: ${JSON.stringify(err, null, 2)}.` }));
  }
}

function* clearFinishedTaskRequest(action) {
  try {
    yield put(addLogEntry({ type: 'data', data: 'Clearing finished task.' }));
    yield sharedTaskController.reqClearFinishedTask(action.payload);
  } catch (err) {
    yield put(addLogEntry({ type: 'error', data: `Failed clearing finished task w/ error: ${JSON.stringify(err, null, 2)}.` }));
  }
}

export default function* rootSaga() {
  yield takeEvery(START_TASK_REQUEST, startTaskRequest);
  yield takeEvery(STOP_TASK_REQUEST, stopTaskRequest);
  yield takeEvery(FETCH_TASKS_REQUEST, fetchTasksRequest);
  yield takeEvery(CLEAR_FINISHED_TASK_REQUEST, clearFinishedTaskRequest);
}
