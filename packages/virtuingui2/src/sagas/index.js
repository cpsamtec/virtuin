//@flow
import {  all } from 'redux-saga/effects';

// import { call, put, takeLatest, all, fork, take } from 'redux-saga/effects';
// import { delay, eventChannel } from 'redux-saga';

/* ------------- Types ------------- */

/* ------------- Sagas ------------- */

/* ------------- Connect Types To Sagas ------------- */

function* watchWebsocket() {
  // use take latest so to ensure to not create multiple web socket connections
  // yield takeLatest(ChassisDataSaga.initializeWebSocket, initializeWebSocketChannel);
}


export default function* rootSaga () {
  yield all([
    // some sagas only receive an action
    watchWebsocket()
  ])
}
