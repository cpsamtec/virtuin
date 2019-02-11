import { createSelector } from 'reselect';

const getTaskIdentifier = state => state.taskView.identifier;
const getTaskGroup = state => state.virtuin.groups;

export default createSelector(
  [getTaskIdentifier, getTaskGroup], 
  ({groupIndex, taskIndex}, taskGroup) => {
    if (taskGroup == null) return null;
    return taskGroup[groupIndex].tasksStatus[taskIndex]
  }
)
