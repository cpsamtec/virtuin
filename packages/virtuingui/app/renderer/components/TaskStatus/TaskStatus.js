import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import style from './TaskStatus.scss';

class TaskStatus extends Component {
  static propTypes = {
    taskName: PropTypes.string.isRequired,
    task: PropTypes.shape({
      id: PropTypes.string,
      state: PropTypes.string,
      taskUUID: PropTypes.string,
      name: PropTypes.string,
      time: PropTypes.number,
      error: PropTypes.string
    }),
    status: PropTypes.shape({
      state: PropTypes.string,
      passed: PropTypes.bool,
      progress: PropTypes.number
    }).isRequired,
  };

  static defaultProps = {
    task: null
  };

  state = {
    loadingDots: '',
  }

  componentWillMount = () => {
    this.dotInterval = setInterval(() => {
      let newLoadingDots = `${this.state.loadingDots}.`;
      if (newLoadingDots.length > 3) newLoadingDots = '';
      this.setState({ loadingDots: newLoadingDots });
    }, 1000);
  }

  componentWillUnmount = () => {
    clearInterval(this.dotInterval);
  }

  render() {
    // No task has run nor started
    if (this.props.task == null) return (<div />);

    // Task about to start
    if (this.props.task.state === 'START_REQUEST') {
      return (
        <div style={{ textAlign: 'left' }} className={style.passedTask}>
          <Typography type="subheading">Task: {this.props.taskName}</Typography>
          <Typography type="title">{`Starting${this.state.loadingDots}`}</Typography>
        </div>
      );
    }

    // Task stop requested
    if (this.props.task.state === 'STOP_REQUEST') {
      return (
        <div style={{ textAlign: 'left' }} className={style.passedTask}>
          <Typography type="subheading">Task: {this.props.taskName}</Typography>
          <Typography type="title">{`Stopping${this.state.loadingDots}`}</Typography>
        </div>
      );
    }

    // task passed
    if (this.props.status.state === 'FINISHED' && this.props.status.passed) {
      return (
        <div className={style.passedTask}>
          <Typography type="subheading">Task: {this.props.taskName}</Typography>
          <Typography type="title">Passed</Typography>
        </div>
      );
    }
    // task failed
    if (this.props.status.state === 'FINISHED' && !this.props.status.passed) {
      return (
        <div className={style.failedTask}>
          <Typography type="subheading">Task: {this.props.taskName}</Typography>
          <Typography type="title">Failed</Typography>
        </div>
      );
    }
    // task quit (or server reported finished before task)
    if (this.props.task.state === 'KILLED' || this.props.task.state === 'FINISHED') {
      return (
        <div className={style.failedTask}>
          <Typography type="subheading">Task: {this.props.taskName}</Typography>
          <Typography type="title">Quit</Typography>
        </div>
      );
    }
    // task is running
    const progressValue = parseInt(this.props.status.progress || 0, 10);

    return (
      <div className={style.statusArea}>
        <span className={style.status}>
          <b>Status:</b> {`${this.props.status.state || this.props.task.state}${this.state.loadingDots}`}
        </span>
        <div className={style.statusBar}>
          <LinearProgress
            variant="determinate"
            value={progressValue}
          />
          <span className={style.statusNumber}>{`${progressValue}%`}</span>
        </div>
      </div>
    );
  }
}
export default TaskStatus;
