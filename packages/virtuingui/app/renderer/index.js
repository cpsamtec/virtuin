import React from 'react';
import { createHashHistory, createBrowserHistory } from 'history';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { getInitialStateRenderer } from 'electron-redux';
import Root from './containers/Root';
import { configureStore } from '../shared/store/configureStore';
import './assets/css/app.global.css';

const initialState = getInitialStateRenderer();

let history;
if (process.env.NODE_ENV === 'production') {
  history = createBrowserHistory();
} else {
  history = createHashHistory();
}
const store = configureStore(initialState, 'renderer', history);

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./containers/Root');
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
