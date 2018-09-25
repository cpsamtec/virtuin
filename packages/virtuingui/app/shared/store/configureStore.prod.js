// @flow
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'react-router-redux';
import { forwardToMain, forwardToRenderer, triggerAlias, replayActionMain, replayActionRenderer } from 'electron-redux';
import getRootReducer from '../reducers';
import rootSaga from '../sagas/sagas';

type scopeType = 'main' | 'renderer';
// $FlowFixMe
type hystoryType = ?Object;
// $FlowFixMe
type rootState = ?Object;

function configureStore(initialState: rootState, scope: scopeType = 'main', history: hystoryType = undefined) {
  console.log('slelksjelkjse');
  let middleware = [];
  const enhancers = [];
  middleware.push(thunk);

  if (scope === 'renderer' && history) {
    const router = routerMiddleware(history);
    middleware.push(router);
  }

  const sagaMiddleware = createSagaMiddleware();
  middleware.push(sagaMiddleware);

  if (scope === 'renderer') {
    middleware = [
      forwardToMain,
      ...middleware,
    ];
  } else if (scope === 'main') {
    middleware = [
      triggerAlias,
      ...middleware,
      forwardToRenderer,
    ];
  }
  const rootReducer = getRootReducer(scope);
  enhancers.push(applyMiddleware(...middleware));

  // $FlowFixMe
  const enhancer = compose(...enhancers);
  const store = createStore(rootReducer, initialState, enhancer);

  console.log('OOY here');
  if (scope === 'main') {
    console.log('OOY in main');
    sagaMiddleware.run(rootSaga);
    replayActionMain(store);
  } else {
    console.log('OOY in renderer');
    replayActionRenderer(store);
  }

  return store;
}

export default { configureStore };
