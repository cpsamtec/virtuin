import { connect } from 'react-redux';
import getCurrentTask from '../../selectors/currentTask';
import TaskView from './TaskView';

const mapDispatchToProps = dispatch => ({});

const mapStateToProps = (state, ownProps) => {
  return {
    taskView: getCurrentTask(state)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskView);
