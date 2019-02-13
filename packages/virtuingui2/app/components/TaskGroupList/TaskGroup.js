import React,  { useState } from 'react';
import Collapse from '@material-ui/core/Collapse';
import ListSubheader from '@material-ui/core/ListSubheader';
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

import { FlexRow, Line, ToggleButton } from './TaskGroupList.style';
import Task from './Task';

const TaskGroup = ({taskGroup}) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <ListSubheader>
        <FlexRow>
          {taskGroup.name}
          <Line />
          <ToggleButton onClick={() => setOpen(!open)}>
            {open ? <ArrowDropDown fontSize="small" /> : <ArrowLeft fontSize="small" />} 
          </ToggleButton>
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