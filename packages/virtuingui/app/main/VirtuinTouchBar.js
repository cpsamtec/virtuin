import { TouchBar } from 'electron';
import { stopTaskRequest } from '../shared/actions/task';

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar;

class VirtuinTouchBar {
  constructor(store, browserWin) {
    this.win = browserWin;
    this.store = store;
  }

  initialize = () => {
    this.tbTaskNameLabel = new TouchBarLabel({ label: 'Name: --', textColor: '#ABCDEF' });
    this.tbTaskProgressLabel = new TouchBarLabel({ label: '(--%)', textColor: '#ABCDEF' });
    this.tbTaskStateLabel = new TouchBarLabel({ label: 'State: --', textColor: '#ABCDEF' });
    this.tbTaskButton = new TouchBarButton({
      label: '',
      backgroundColor: '#000000',
      click: () => {
        if (this.tbTaskButton.label === 'STOP') {
          this.store.dispatch(stopTaskRequest(this.activeTask.taskUUID));
        }
      }
    });
    const touchBar = new TouchBar([
      this.tbTaskNameLabel,
      new TouchBarSpacer({ size: 'small' }),
      this.tbTaskStateLabel,
      new TouchBarSpacer({ size: 'small' }),
      this.tbTaskProgressLabel,
      new TouchBarSpacer({ size: 'small' }),
      this.tbTaskButton
    ]);
    this.win.setTouchBar(touchBar);
    this.unsubscribe = this.store.subscribe(this.handleStoreChange);
  }

  handleStoreChange = () => {
    const prevTaskStatus = this.taskStatus;
    const prevActiveTask = this.activeTask;
    const state = this.store.getState();
    this.activeTask = state.task.activeTask;
    this.taskStatus = state.taskStatus;
    if ((prevActiveTask !== this.activeTask) && this.activeTask.id) {
      this.tbTaskNameLabel.label = `Name: ${this.activeTask.name}`;
      this.tbTaskStateLabel.label = `State: ${this.activeTask.state}`;
      if (this.activeTask.state === 'RUNNING') {
        this.tbTaskButton.label = 'STOP';
        this.tbTaskButton.backgroundColor = '#FF6A51';
      } else {
        this.tbTaskButton.label = '';
        this.tbTaskButton.backgroundColor = '#000000';
      }
    }
    if (prevTaskStatus !== this.taskStatus) {
      this.tbTaskProgressLabel.label = `${parseInt(this.taskStatus.progress || 0, 10)}%`;
    }
  }

  close = () => {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

export default {
  VirtuinTouchBar
};
