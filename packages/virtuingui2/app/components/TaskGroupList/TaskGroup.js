import React,  { useState } from 'react';
import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';
import ListSubheader from '@material-ui/core/ListSubheader';
import ArrowRight from '@material-ui/icons/ArrowRight';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

import { FlexRow, Line, ToggleButton } from './TaskGroupList.style';
import Task from './Task';

const TaskGroup = ({taskGroup}) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <ListSubheader>
        <FlexRow>
          <ToggleButton onClick={() => setOpen(!open)}>
            {open ? <ArrowDropDown fontSize="small" /> : <ArrowRight fontSize="small" />} 
          </ToggleButton>
          {taskGroup.name}
          <Line />
          <Button variant="outlined" size="small" color="secondary">
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