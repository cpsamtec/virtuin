import { connect } from 'react-redux';
import SideBar from '../components/SideBar/SideBar';
import { stopTaskRequest } from '../../shared/actions/task';

const mapStateToProps = state => {
  const taskStatus = state.taskStatus;
  const activeTask = state.task.activeTask;
  return {
    task: activeTask,
    status: taskStatus,
    tasks: state.task.tasks,
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
)(SideBar);
