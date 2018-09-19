import { connect } from 'react-redux';
import TaskControls from '../components/TaskControls/TaskControls';
import { stopTaskRequest, startTaskRequest, clearFinishedTaskRequest } from '../../shared/actions/task';

import type { DispatchUpdatePrimaryStatus, DispatchStatus } from 'virtuintaskdispatcher';
// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, ownProps) => {
  const taskStatus = state.taskStatus;
  const activeTask = state.task.activeTask;
  return {
    task: activeTask,
    status: taskStatus,
    location: state.routing.location,
  };
};

const mapDispatchToProps = dispatch => (
  {
    stopTask: taskIdentifier: TaskIdentifier => {
      dispatch(stopTaskRequest(taskIdentifier));
    },
    startTask: taskIdentifier: TaskIdentifier => {
      dispatch(startTaskRequest(taskIdentifier));
    },
    clearTask: taskIdentifier: TaskIdentifier => {
      dispatch(clearFinishedTaskRequest(taskIdentifier));
    }
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskControls);
