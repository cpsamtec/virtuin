import { connect } from 'react-redux';
import TaskView from './TaskView';

const mapDispatchToProps = dispatch => ({});

const mapStateToProps = (state, ownProps) => {
  return {
    taskView: state.taskView
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskView);
