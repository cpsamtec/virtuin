import React from 'react';
import List from '@material-ui/core/List';
import TaskGroup from './TaskGroup';

const TaskGroupList = ({groups}) => {
  return (
    <List>
      {groups.map(taskGroup => (
        <TaskGroup 
          taskGroup={taskGroup} 
          key={taskGroup.name}
        />
      ))}
    </List>
  )
}

export default TaskGroupList;