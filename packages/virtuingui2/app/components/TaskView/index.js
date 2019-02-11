import { connect } from 'react-redux';
import { createSelector } from 'reselect'
import TaskView from './TaskView';
import { stat } from 'fs';



const getTaskIdentifier = state => state.taskView.identifier;
const getTaskGroup = state => state.virtuin.groups;

const getCurrentTask = createSelector(
  [getTaskIdentifier, getTaskGroup], 
  ({groupIndex, taskIndex}, taskGroup) => taskGroup[groupIndex].tasksStatus[taskIndex]
)

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
