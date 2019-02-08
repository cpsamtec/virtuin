//@flow

import { combineReducers } from 'redux';
import configureStore from './CreateStore';
import rootSaga from '../sagas/';
import sidebar from './Sidebar';
import virtuin from './Virtuin';
import taskView from './TaskView';

/* ------------- Assemble The Reducers ------------- */

export const reducers = combineReducers({
  sidebar, virtuin, taskView
})


export default () => {
  let finalReducers = reducers
  let { store, sagasManager, sagaMiddleware } = configureStore(finalReducers, rootSaga)

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('./').reducers
      store.replaceReducer(nextRootReducer)

      const newYieldedSagas = require('../sagas').default
      sagasManager.cancel()
      sagasManager.done.then(() => {
        sagasManager = sagaMiddleware.run(newYieldedSagas)
      })
    })
  }

  return store
}
