// @flow
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { routerMiddleware, routerActions } from 'react-router-redux';
import { forwardToMain, forwardToRenderer, triggerAlias, replayActionMain, replayActionRenderer } from 'electron-redux';
// import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import getRootReducer from '../reducers';
import rootSaga from '../sagas/sagas';

type scopeType = 'main' | 'renderer';
type rootState = ?Object;

function configureStore(initialState: rootState, scope: scopeType = 'main', history = undefined) {
  // Redux Configuration
  let middleware = [];
  const rootReducer = getRootReducer(scope);
  const enhancers = [];
  const sagaMiddleware = createSagaMiddleware();

  // Thunk Middleware
  middleware.push(thunk);
  middleware.push(sagaMiddleware);

  // Logging Middleware
  // const logger = createLogger({
  //   level: scope === 'main' ? undefined : 'info',
  //   collapsed: true
  // });
  // middleware.push(logger);

  // Router Middleware
  if (scope === 'renderer' && history) {
    const router = routerMiddleware(history);
    middleware.push(router);
  }

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

  // Redux DevTools Configuration
  const actionCreators = {
    ...routerActions,
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  let composeEnhancers = compose;
  if (scope === 'renderer') {
    composeEnhancers = window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
        actionCreators,
      }) : compose;
  }
  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')(scope)) // eslint-disable-line global-require
    );
  }

  console.log('OOY here');
  if (scope === 'main') {
    console.log('OOY main');
    sagaMiddleware.run(rootSaga);
    debugger;
    replayActionMain(store);
  } else {
    debugger;
    console.log('OOY renderer');
    replayActionRenderer(store);
  }

  return store;
}

export default { configureStore };
