import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Task from '../components/Task/Task';
import * as TaskConfigActions from '../../shared/actions/taskConfigs';
import * as TaskControlActions from '../../shared/actions/taskControls';

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => (
  {
    taskConfigs: state.taskConfigs,
    taskControls: state.taskControls,
  }
);

const mapDispatchToProps = (dispatch) => (
  bindActionCreators(Object.assign({}, TaskConfigActions, TaskControlActions), dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Task);
