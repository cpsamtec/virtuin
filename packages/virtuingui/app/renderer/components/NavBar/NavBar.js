
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import TaskControls from '../../containers/TaskControls';
import TaskStatus from '../../containers/TaskStatus';
import style from './NavBar.scss';

class NavBar extends Component {
  static propTypes = {
    activeTask: PropTypes.shape({
      id: PropTypes.string,
      state: PropTypes.string,
      taskUUID: PropTypes.string,
      name: PropTypes.string,
      time: PropTypes.number,
      error: PropTypes.string
    }),
    task: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    }),
    location: PropTypes.shape({
      pathname: PropTypes.string
    }).isRequired
  };

  static defaultProps = {
    activeTask: null,
    task: null
  }

  state = {
    isNewTask: false,
  }

  componentWillReceiveProps = (nextProps) => {
    const isNewTask = nextProps.activeTask && nextProps.activeTask.id && (`/task/${nextProps.activeTask.id}` !== this.props.location.pathname);
    this.setState({ isNewTask });
  }

  render() {
    const name = this.props.task ? this.props.task.name : '';
    const curPath = this.props.location.pathname;
    const newPath = this.state.isNewTask ? `/task/${this.props.activeTask.id}` : '';
    if (this.state.isNewTask && (newPath !== curPath)) {
      return (<AppBar position="absolute" className={[style.navBar].join(' ')}><Redirect to={newPath} /> </AppBar>);
    }
    return (
      <AppBar position="static" className={[style.navBar].join(' ')}>
        <Toolbar className={[style.navRow].join(' ')}>
          <Typography type="title" style={{ flex: '1', }}>
            {name}
          </Typography>
          <div className={style.statusBar}>
            <div className={style.rightSideBar}>
              <TaskStatus />
              <TaskControls />
            </div>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default NavBar;
