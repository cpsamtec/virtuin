import React from 'react';

const TaskView = ({taskView}) => {
  return (
    <div style={{flexGrow: 1, position: 'relative'}}>
      <webview
      autosize="on"
      src={taskView ? taskView.viewURL : ''}
      style={{ width: '100%', height: '100%', position: 'absolute' }}
    />
    </div>
    
  );
}

export default TaskView;