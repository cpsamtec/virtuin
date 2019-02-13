//@flow
import { eventChannel, delay } from 'redux-saga';
import { all, take, call, race, put, fork } from 'redux-saga/effects';
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
    console.log('starting IPC');
    const ipcChannel = yield call(watchMessages);
    yield fork(connectToIpc);
    const { cancel } = yield race({
      task: all([call(externalListener, ipcChannel), call(internalListener, ipcRenderer)]),
      cancel: take(IPCSagaActions.stopIpc)
    });
    
    if (cancel) {
      ipcRenderer.removeAllListeners();
    }
  }
}
// called in parallel to connect to ipc and cause the vm container to start
function* connectToIpc() {
  yield put(VirtuinSagaActions.connect()); //connect the server and client ipc
  yield put(VirtuinSagaActions.up()); // start container
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
    const {event, action} = yield take(ipcChannel);
    yield put(action);
  }
}

function watchMessages() {
  return eventChannel(emit => {
    // take every response and emit
    const responseHandler = (event, arg) => {
      console.log('Recieved from dispatcher', arg);
      emit({event, action: arg});
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
