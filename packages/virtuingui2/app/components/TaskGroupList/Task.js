import React from 'react';
import { connect } from 'react-redux';
import ReactSVG from 'react-svg'

import Divider from '@material-ui/core/Divider';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

import { setTaskView } from '../../redux/TaskView';
import { VirtuinSagaActions } from '../../redux/Virtuin';

import { ListItem, ListItemPrimary } from './TaskGroupList.style';
import PlayArrow from '../../assets/svgs/playArrow.svg';
console.log('PlayArrow', PlayArrow);
import OutlinedChip from '../OutlinedChip';
import CircleButton from '../CircleButton';
import CircleProgress from '../CircleProgress';

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
const Task = ({task, last, currentTask, setTaskView, runTask}) => {
  const showTaskProgress = task.state.match(/(START_REQUEST|STOP_REQUEST|RUNNING)/);
  const {groupIndex, taskIndex} = task.identifier;
  const active = currentTask.groupIndex === groupIndex && currentTask.taskIndex === taskIndex;
  return (
    <>
      <ListItem button={!active} active={active} key={task.name} onClick={() => setTaskView(task)}>
        <ListItemText 
          primary={
            <div>
              <ListItemPrimary>{task.name}</ListItemPrimary>
              <OutlinedChip label={stateNameMapper(task.state)} color={stateMapper(task.state)} />
            </div>
          } 
          secondary={task.description} />
          <ListItemSecondaryAction>
            {showTaskProgress ? 
              <CircleProgress value={task.progress} /> :
              <CircleButton onClick={runTask.bind(null, groupIndex, taskIndex)}>
                <PlayArrow />
              </CircleButton>
            }
          </ListItemSecondaryAction>
      </ListItem>
      {last ? null : <Divider key="divider" />}
    </>
  )
}

const mapDispatchToProps = (dispatch) => ({
  setTaskView: (task) => dispatch(setTaskView(task)),
  runTask: (groupIndex, taskIndex) => dispatch(VirtuinSagaActions.run(groupIndex, taskIndex))
})

const mapStateToProps = (state, ownProps) => {
  return ({
    currentTask: state.taskView.identifier
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(Task);