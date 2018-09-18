import { connect } from 'react-redux';
import TaskStatus from '../components/TaskStatus/TaskStatus';
import { stopTaskRequest } from '../../shared/actions/task';


const mapStateToProps = state => {
  const taskStatus = state.taskStatus;
  const activeTask = state.task.activeTask;
  const task = state.task.tasks.find((curTask) => (
    activeTask && activeTask.id && (curTask.id === activeTask.id)
  ));
  const taskName = task != null ? task.name : 'N/A';
  return {
    taskName,
    task: activeTask,
    status: taskStatus,
    location: state.location,
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
)(TaskStatus);
