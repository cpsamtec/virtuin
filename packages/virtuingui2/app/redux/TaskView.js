import { createActions, handleActions } from 'redux-actions';

const defaultState = {
  name: 'Task 0',
  description: 'here is the task description',
  progress: 63,
  identifier: { groupIndex: 0, taskIndex: 0 },
  state: 'KILLED',
  autoStart: true,
  taskUUID: '1232132',
  error: null,
  viewURL: 'http://github.com',
  startDate: 'now',
  completeDate: 'tomorrow',
  messages: ['hi', 'hola'],
  stdout: 'huh',
  stderr: ''
};

export const { setTaskView } = createActions({
  SET_TASK_VIEW: task => ({ task })
});

const reducer = handleActions(
  {
    [setTaskView]: (state, { payload: { task } }) => ({ ...task })
  },
  defaultState
);

export default reducer;
