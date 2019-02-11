import React from 'react';

export default class TaskView extends React.Component {
  render() {
    return (
      <webview
        src={this.props.taskView.viewURL}
        style={{ width: '100%', height: 'calc(100% - 80px)' }}
      />
    );
  }
}
