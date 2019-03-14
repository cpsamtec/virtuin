import React from 'react';

import List from '@material-ui/core/List';
import TaskGroup from './TaskGroup';

const TaskGroupList = ({statusMessage, groups, resetGroup}) => {
  if (!groups) return null;
  return (
    <List>
      {groups.map((taskGroup, groupIndex) => (
        <TaskGroup
          taskGroup={taskGroup}
          resetGroup={resetGroup.bind(null, groupIndex)}
          key={taskGroup.name}
        />
      ))}
    </List>
  )
}

export default TaskGroupList;
