import React,  { useState } from 'react';
import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';
import ListSubheader from '@material-ui/core/ListSubheader';
import ArrowRight from '@material-ui/icons/ArrowRight';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

import { FlexRow, Line, ToggleButton } from './TaskGroupList.style';
import Task from './Task';

const inProgress = /(START_REQUEST|STOP_REQUEST|RUNNING)/;

const isRunnable = taskGroup => taskGroup.tasksStatus.reduce((acc,task) => acc && !task.state.match(inProgress),  true)


const TaskGroup = ({taskGroup, resetGroup}) => {
  const [open, setOpen] = useState(true);
  const allowReset = taskGroup.mode == 'user' && isRunnable(taskGroup);
  return (
    <>
      <ListSubheader>
        <FlexRow>
          <ToggleButton onClick={() => setOpen(!open)}>
            {open ? <ArrowDropDown fontSize="small" /> : <ArrowRight fontSize="small" />} 
          </ToggleButton>
          {taskGroup.name}
          <Line />
          <Button onClick={resetGroup} variant="outlined" size="small" color="secondary" disabled={!allowReset}>
            Reset
          </Button>
          
        </FlexRow>
        
      </ListSubheader>
      <Collapse in={open}>
        {taskGroup.tasksStatus.map((task, taskIdx) => (
          <Task 
            key={task.name} 
            task={task} 
            last={taskIdx === taskGroup.tasksStatus.length - 1}
          />
        ))}
        
      </Collapse>
  </>)
}

export default TaskGroup;