import { connect } from 'react-redux';
import TaskControls from '../components/TaskControls/TaskControls';
import { stopTaskRequest, startTaskRequest } from '../../shared/actions/dispatch';

import type { DispatchUpdatePrimaryStatus, DispatchStatus } from 'virtuintaskdispatcher';
// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, ownProps) => {
  return {
    status: state.dispatchStatus,
    location: state.routing.location,
  };
};

const mapDispatchToProps = dispatch => (
  {
    stopTask: (taskIdentifier: TaskIdentifier) => {
      dispatch(stopTaskRequest(taskIdentifier));
    },
    startTask: (taskIdentifier: TaskIdentifier) => {
      dispatch(startTaskRequest(taskIdentifier));
    }
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskControls);
