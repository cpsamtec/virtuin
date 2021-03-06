//@flow
import { eventChannel } from 'redux-saga';
import { all, take, call, race, put, fork , delay} from 'redux-saga/effects';
import { IPCSagaActions } from '../redux/IPC';
import { VirtuinSagaActions } from '../redux/Virtuin';

const { ipcRenderer } = require('electron');

// import { call, put, takeLatest, all, fork, take } from 'redux-saga/effects';
// import { delay, eventChannel } from 'redux-saga';

/* ------------- Types ------------- */
export const ipcChannels = {
  action: 'VITUIN_DELEGATOR_ACTION',
  response: 'VIRTUIN_DELEGATOR_RESPONSE',
  prompt: 'VIRTUIN_DELEGATOR_PROMPT'
}

/* ------------- Sagas ------------- */

/* ------------- Connect Types To Sagas ------------- */

function* ipcHandling() {
  while (true) {
    const data = yield take(IPCSagaActions.startIpc);
    const ipcChannel = yield call(watchMessages);
    ipcRenderer.send(ipcChannels.action, VirtuinSagaActions.connect());
    const { cancel } = yield race({
      task: all([call(externalListener, ipcChannel), call(internalListener, ipcRenderer)]),
      cancel: take(IPCSagaActions.stopIpc)
    });
    
    if (cancel) {
      ipcRenderer.removeAllListeners();
      yield put(VirtuinSagaActions.down());
    }
  }
}

function* internalListener(ipcRenderer) {
  while (true) {
    // take every virtuin saga action and send over ipc
    const action = yield take(Object.values(VirtuinSagaActions));
    ipcRenderer.send(ipcChannels.action, action);
  }
}

function* externalListener(ipcChannel) {
  while (true) {
    // take every ipc response action and dispatch
    const {channel, action} = yield take(ipcChannel);
    yield put(action);
  }
}

function watchMessages() {
  return eventChannel(emit => {
    // take every response and emit
    const responseHandler = (_, action) => {
      emit({ action, channel: ipcChannels.response });
    }
    const unsubscribe = () => {
       ipcRenderer.removeAllListeners();
    }
    ipcRenderer.on(ipcChannels.response, responseHandler);
    return unsubscribe;
  });
}

export default function* rootSaga () {
  yield all([
    // some sagas only receive an action
    ipcHandling()
  ])
}
