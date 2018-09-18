import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Play from '@material-ui/icons/PlayArrow';
import Stop from '@material-ui/icons/Stop';
import Check from '@material-ui/icons/Check';
import View from '@material-ui/icons/RemoveRedEye';
import style from './TaskControls.scss';

class TaskControls extends Component {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string
    }).isRequired,
    task: PropTypes.shape({
      id: PropTypes.string,
      state: PropTypes.string,
      taskUUID: PropTypes.string,
      name: PropTypes.string,
      time: PropTypes.number,
      error: PropTypes.string
    }),
    status: PropTypes.shape({
      state: PropTypes.string
    }).isRequired,
    stopTask: PropTypes.func.isRequired,
    clearTask: PropTypes.func.isRequired
  };

  static defaultProps = {
    task: null
  };

  render() {
    const currTaskView = this.props.location.pathname.replace('/task/', '');
    return (
      <div className={style.buttonListContainer}>
        {/* only */}
        {(this.props.task == null) &&
          <Button
            className={style.playButton}
          >
            <Play />
          </Button>
        }
        {(this.props.task != null && this.props.task.state === 'RUNNING' && currTaskView === this.props.task.id) &&
          <Button
            className={style.stopButton}
            onClick={() => { this.props.stopTask(this.props.task.taskUUID); }}
          >
            <Stop />
          </Button>
        }
        {(this.props.task != null && (this.props.task.state === 'FINISHED' || this.props.task.state === 'KILLED') && currTaskView !== '') &&
          <Button
            className={style.newButton}
            onClick={() => { this.props.clearTask(); console.log('Clearing task'); }}
          >
            <Check />
          </Button>
        }
        {(this.props.task != null && this.props.task.state === 'RUNNING' && this.props.status.state !== 'FINISHED' && currTaskView !== this.props.task.id) &&
          <Link to={`/task/${this.props.task.id}`}>
            <Button
              className={style.viewButton}
            >
              <View />
            </Button>
          </Link>
        }

      </div>
    );
  }
}

export default TaskControls;
