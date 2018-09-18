import { connect } from 'react-redux';
import DetailTaskView from '../components/Task/DetailTaskView';

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => {
  const activeTask = state.task.activeTask;
  const taskDetails = activeTask.id ? state.task.tasks.find(t => t.id === activeTask.id) : undefined;
  return {
    activeTask,
    taskDetails
  };
};

export default connect(
  mapStateToProps
)(DetailTaskView);
