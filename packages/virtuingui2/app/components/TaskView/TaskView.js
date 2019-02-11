import React from 'react';

const TaskView = ({taskView}) => {
  return (
    <webview
      src={taskView ? taskView.viewURL : ''}
      style={{ width: '100%', height: 'calc(100% - 80px)' }}
    />
  );
}

export default TaskView;