import React from 'react';
import ListSubheader from '@material-ui/core/ListSubheader';
import Task from './Task';

const TaskGroup = ({taskGroup}) => {
  return (
    <>
      <ListSubheader>
        {taskGroup.name}
      </ListSubheader>
      <>
        {taskGroup.tasksStatus.map((task, taskIdx) => (
          <Task 
            key={task.name} 
            task={task} 
            last={taskIdx === taskGroup.tasksStatus.length - 1}
          />
        ))}
      </>
  </>)
}

export default TaskGroup;