/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import App from './containers/App';
//import TaskView from './containers/TaskView';

export default () => (
  <App>
  <div>
    <h1> Hello </h1>
  </div>
  </App>
);
/*
export default () => (
  <App>
    <Switch>
      <Route path="/task" component={TaskView} />
      <Redirect from="/" to="/task" />
    </Switch>
  </App>
);*/
