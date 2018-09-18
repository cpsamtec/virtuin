import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { MuiThemeProvider } from '@material-ui/core/styles';
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Switch, Route } from 'react-router-dom';

import SideBar from '../../containers/SideBar';
import NavBar from '../../containers/NavBarContainer';
import DetailTaskView from '../../containers/DetailTaskView';
import Console from '../../containers/Console';
import styles from './Task.scss';
import EmptyTaskView from './EmptyTaskView';
import darkTheme from '../../themes/darkTheme';
import lightTheme from '../../themes/lightTheme';

class TaskHelp extends Component {
  static propTypes = {
    match: PropTypes.objectOf({ params: PropTypes.objectOf({ id: PropTypes.string }) }).isRequired
  };

  render() {
    return (
      <h3>Help info for task { this.props.match.params.id }</h3>
    );
  }
}

// eslint-disable-next-line
export default class Task extends Component {

  static propTypes = {
  };

  state = {
  };

  webView = {};
  scrollView = {};
  infoTables = {};

  render() {
    return (
      <MuiThemeProvider theme={darkTheme}>
        <div className={styles.container}>
          <SideBar />
          <div className={styles.taskView} >
            <NavBar
              key="task-navbar"
            />
            <div
              className={styles.taskScrollView}
              ref={(scrollView) => { this.scrollView = scrollView; }}
            >
              <MuiThemeProvider theme={lightTheme}>
                <Switch>
                  <Route exact path="/task" component={EmptyTaskView} />
                  <Route exact path="/task/:id/help" component={TaskHelp} />
                  <Route path="/task/:id" component={DetailTaskView} />
                </Switch>
              </MuiThemeProvider>
            </div>
            <Console />
          </div>

        </div>
      </MuiThemeProvider>
    );
  }
}
