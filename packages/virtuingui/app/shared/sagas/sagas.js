import { put, takeEvery } from 'redux-saga/effects';
import { sharedTaskController } from '../../main/TaskController';
import { addLogEntry } from '../actions/log';

function* startTaskRequest(action) {
  try {
    const actTask = yield sharedTaskController.reqStartTask(action.payload);
    yield put(addLogEntry({ type: 'success', data: `Successfully started task` }));
  } catch (err) {
    yield put(startTaskRequestFailed(err));
    yield put(addLogEntry({ type: 'error', data: `Failed starting task w/ error: ${JSON.stringify(err, null, 2)}.` }));
  }
}

function* stopTaskRequest(action) {
  try {
    const succ = yield sharedTaskController.reqStopTask(action.payload);
    yield put(addLogEntry({ type: 'success', data: 'Successfully stopped task.' }));
  } catch (err) {
    yield put(stopTaskRequestFailed(err));
    yield put(addLogEntry({ type: 'error', data: `Failed killing task w/ error: ${JSON.stringify(err, null, 2)}.` }));
  }
}


export default function* rootSaga() {
  yield takeEvery(START_TASK_REQUEST, startTaskRequest);
  yield takeEvery(STOP_TASK_REQUEST, stopTaskRequest);
}
