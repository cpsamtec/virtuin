import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App';
// import { configureStore, history } from './store/configureStore';

// const store = configureStore();
console.log("????")
render(
  <AppContainer>
    <App/>
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./App', () => {
    // eslint-disable-next-line global-require
    const App = require('./App').default;
    render(
      <AppContainer>
        <App/>
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
