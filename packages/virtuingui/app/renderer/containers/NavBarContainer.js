import { connect } from 'react-redux';
import NavBar from '../components/NavBar/NavBar';
import { stopTaskRequest } from '../../shared/actions/task';

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => {
  const taskStatus = state.taskStatus;
  const activeTask = state.task.activeTask;
  const location = state.routing.location;
  const task = state.task.tasks.find((curTask) =>
    (activeTask && activeTask.id && (curTask.id === activeTask.id))
  );
  return {
    location,
    activeTask,
    status: taskStatus,
    task
  };
};

const mapDispatchToProps = dispatch => (
  {
    stopTask: taskUUID => {
      dispatch(stopTaskRequest(taskUUID));
    }
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBar);
