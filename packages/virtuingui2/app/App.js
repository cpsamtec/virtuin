import React, { Component } from 'react';
import styled from '@emotion/styled';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { Provider } from 'react-redux';
import theme from './theme';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TaskGroupList from './components/TaskGroupList';

import createStore from './redux';
import TaskView from './components/TaskView';

// create our store
const store = createStore();

const AppContainer = styled.div`
  display: flex;
`;

const View = styled.div`
  width: 100%;
`;

console.log("AHHHH")

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <>
          <CssBaseline />
          <MuiThemeProvider theme={theme}>
            <AppContainer>
              <Sidebar>
                <TaskGroupList />
              </Sidebar>
              <View>
                <Navbar />
                <TaskView />
              </View>
            </AppContainer>
          </MuiThemeProvider>
        </>
      </Provider>
    );
  }
}

export default App;