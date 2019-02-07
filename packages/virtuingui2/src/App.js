import React, { Component } from 'react';
import styled from '@emotion/styled/macro';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { Provider } from 'react-redux';
import theme from './theme';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TaskGroupList from './components/TaskGroupList';

import createStore from './redux';

// create our store
const store = createStore();

const AppContainer = styled.div`
  display: flex;
`;

const View = styled.div`
  width: 100%;
`;

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div>
          <CssBaseline />
          <MuiThemeProvider theme={theme}>
            <AppContainer>
              <Sidebar>
                <TaskGroupList />
              </Sidebar>
              <View>
                <Navbar />
              </View>
            </AppContainer>
          </MuiThemeProvider>
        </div>
      </Provider>
    );
  }
}

export default App;
