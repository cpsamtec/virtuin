import React from 'react';
import ReactSVG from 'react-svg'

import Divider from '@material-ui/core/Divider';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
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
const stateMapper = (state) => {
  return stateMap[state] ? stateMap[state] : 'default'
}
const Task = ({task, last}) => {
  const showTaskProgress = task.state.match(/(START_REQUEST|STOP_REQUEST|FINISHED)/);
  return (
    <>
      <ListItem button active key={task.name}>
        <ListItemText 
          primary={
            <div>
              <ListItemPrimary>{task.name}</ListItemPrimary>
              <OutlinedChip label={task.state} color={stateMapper(task.state)} />
            </div>
          } 
          secondary={task.description} />
          <ListItemSecondaryAction>
            {showTaskProgress ? 
              <CircleProgress value={task.progress} /> :
              <CircleButton disabled onClick={() => {console.log('called circle')}}>
                <PlayArrow />
              </CircleButton>
            }
          </ListItemSecondaryAction>
      </ListItem>
      {last ? null : <Divider key="divider" />}
    </>
  )
}

export default Task;