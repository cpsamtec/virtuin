//@flow
import {  all } from 'redux-saga/effects';
import { take, call, race, put } from 'redux-saga/effects';
import { IPCSagaActions } from '../redux/IPC';
import { VirtuinSagaActions } from '../redux/Virtuin';

const { ipcRenderer } = require('electron');

// import { call, put, takeLatest, all, fork, take } from 'redux-saga/effects';
// import { delay, eventChannel } from 'redux-saga';

/* ------------- Types ------------- */
export const ipcChannels = {
  action: 'VITUIN_DELEGATOR_ACTION',
  response: 'VIRTUIN_DELEGATOR_RESPONSE'
}

const virtuinDelegatorAction = 'VITUIN_DELEGATOR_ACTION';
const virtuinDelegatorResponse = 'VIRTUIN_DELEGATOR_RESPONSE';

/* ------------- Sagas ------------- */

/* ------------- Connect Types To Sagas ------------- */

function* ipcHandling() {
  while (true) {
    const data = yield take(IPCSagaActions.startIpc);
    const ipcChannel = yield call(watchMessages);
    const { cancel } = yield race({
      task: [call(externalListener), call(internalListener)],
      cancel: take(IPCSagaActions.stopIpc)
    });
    if (cancel) {
      ipcRenderer.removeAllListeners();
    }
  }
}

function* internalListener() {
  while (true) {
    // take every virtuin saga action and send over ipc
    const action = yield take(Object.keys(VirtuinSagaActions));
    ipcRenderer.send(ipcChannels.action, action);
  }
}

function* externalListener() {
  while (true) {
    // take every ipc response action and dispatch
    const action = yield take(socketChannel);
    yield put(action);
  }
}

function watchMessages() {
  return eventChannel((emit) => {
    // take every response and emit
    ipcRenderer.on(ipcChannels.response, (event, arg) => emit(event))
    return () => {
      // remove listener
      ipcRenderer.removeAllListeners();
    };
  });
}

export default function* rootSaga () {
  yield all([
    // some sagas only receive an action
    ipcHandling()
  ])
}
