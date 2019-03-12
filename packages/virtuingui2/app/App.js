import React, { Component } from 'react';
import { SnackbarProvider } from 'notistack';
import styled from '@emotion/styled';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Button from '@material-ui/core/Button';
import { Provider } from 'react-redux';
import theme from './theme';

import Notifier from './components/Notifier';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TaskGroupList from './components/TaskGroupList';
import Console from './components/Console';

import createStore from './redux';
import { VirtuinSagaActions } from './redux/Virtuin';
import { IPCSagaActions } from './redux/IPC';

import TaskView from './components/TaskView';

// create our store
const store = createStore();
store.dispatch(IPCSagaActions.startIpc());


const AppContainer = styled.div`
  display: flex;
`;

const View = styled.div`
  width: 100%;
  height: 100vh;
  flex-direction: column;
  display: flex;
  position: relative;
`;

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <>
          <CssBaseline />
          <MuiThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={5} action={
                <Button color="secondary" size="small">
                  {'Dismiss'}
                </Button>
              }
            >
              <AppContainer>
                <Notifier />
                <Sidebar>
                  <TaskGroupList />
                </Sidebar>
                <View>
                  <Navbar />
                  <TaskView />
                  <Console />
                </View>
              </AppContainer>
            </SnackbarProvider>
          </MuiThemeProvider>
        </>
      </Provider>
    );
  }
}

export default App;
