import { connect } from 'react-redux';
import TaskControls from '../components/TaskControls/TaskControls';
import { stopTaskRequest, startTaskRequest, clearFinishedTaskRequest } from '../../shared/actions/task';

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
    stopTask: taskUUID => {
      dispatch(stopTaskRequest(taskUUID));
    },
    startTask: id => {
      dispatch(startTaskRequest(id));
    },
    clearTask: taskUUID => {
      dispatch(clearFinishedTaskRequest(taskUUID));
    }
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskControls);
