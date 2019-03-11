import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import ReactSVG from 'react-svg'

import Divider from '@material-ui/core/Divider';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

import { setTaskView } from '../../redux/TaskView';
import { VirtuinSagaActions } from '../../redux/Virtuin';
import { addNotification } from '../../redux/Notifier';

import { ListItem, ListItemPrimary, ListItemSecondary, FlexRow, TaskButton } from './TaskGroupList.style';
import PlayArrow from '../../assets/svgs/playArrow.svg';
import OutlinedChip from '../OutlinedChip';
import CircleButton from '../CircleButton';
import CircleProgress from '../CircleProgress';

const inProgress = /(START_REQUEST|STOP_REQUEST|RUNNING)/;
const stateMap = {
  'IDLE': 'default',
  'START_REQUEST': 'info',
  'RUNNING': 'info',
  'KILLED': 'error',
  'STOP_REQUEST': 'warn',
  'FINISHED': 'success'
}
const stateMapNames = {
  'IDLE': 'IDLE',
  'START_REQUEST': 'STARTING',
  'RUNNING': 'RUNNING',
  'KILLED': 'KILLED',
  'STOP_REQUEST': 'STOPPING',
  'FINISHED': 'FINISHED'
}
const stateMapper = (state) => {
  return stateMap[state] ? stateMap[state] : 'default'
}
const stateNameMapper = (state) => {
  return stateMapNames[state] ? stateMapNames[state] : '???'
}
const Task = ({task, last, currentTask, isRunnable, setTaskView, runTask, resetTask, addNotification}) => {
  const isRunning = task.state.match(inProgress) != null;
  const {groupIndex, taskIndex} = task.identifier;
  const active = currentTask.groupIndex === groupIndex && currentTask.taskIndex === taskIndex;
  return (
    <>
      <ListItem button={!active} active={active} key={task.name} onClick={setTaskView.bind(null, task.identifier)}>
        <div>
          <ListItemText 
            primary={
              <>
                <ListItemPrimary>{task.name}</ListItemPrimary>
                <OutlinedChip label={stateNameMapper(task.state)} color={stateMapper(task.state)} />
              </>
            } 
            secondary={
              <>
                <ListItemSecondary variant="caption">{task.description}</ListItemSecondary>
                
              </>
            } 
          />
          <FlexRow style={{marginTop: 5}}>
            <TaskButton disabled={isRunning} size="small" onClick={resetTask.bind(null, groupIndex, taskIndex)}>
              Reset
            </TaskButton>
            <TaskButton disabled={task.error == null} size="small" onClick={() => {
              addNotification({
                message: task.error,
                options: {
                  persist: true,
                  variant: 'error',
                },
              });
            }}>
              View Error
            </TaskButton>
          </FlexRow>
        </div>
        <ListItemSecondaryAction>
          {isRunning ? 
            <CircleProgress value={task.progress} /> :
            <CircleButton onClick={runTask.bind(null, groupIndex, taskIndex)} disabled={!isRunnable}>
              <PlayArrow />
            </CircleButton>
          }
        </ListItemSecondaryAction>
      </ListItem>
      {last ? null : <Divider />}
    </>
  )
}


const getTaskGroup = (state, ownProps) => state.virtuin.groups[ownProps.task.identifier.groupIndex];

//is runnable if no task in the group is in progress
const isRunnable = createSelector(
  [getTaskGroup], 
  taskGroup => taskGroup.tasksStatus.reduce((acc,task) => acc && !task.state.match(inProgress),  true)
)
const mapDispatchToProps = (dispatch) => ({
  setTaskView: (identifier) => dispatch(setTaskView(identifier)),
  addNotification: notification => dispatch(addNotification(notification)),
  runTask: (groupIndex, taskIndex) => dispatch(VirtuinSagaActions.run(groupIndex, taskIndex)),
  resetTask: (groupIndex, taskIndex) => dispatch(VirtuinSagaActions.resetTask(groupIndex, taskIndex))
})

const mapStateToProps = (state, ownProps) => {
  return ({
    currentTask: state.taskView.identifier,
    isRunnable: isRunnable(state, ownProps) 
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(Task);