import { createActions, handleActions } from 'redux-actions';

const defaultState = {}
export const VirtuinSagaActions = createActions({
  'CONNECT': () => null,
  'UP': () => null,
  'RUN': (groupIndex, taskIndex) => ({groupIndex, taskIndex}),
  'DOWN': () => null,
  'SEND_DATA': (groupIndex, taskIndex) => ({groupIndex, taskIndex}),
  'BEGIN_TASKS_IF_AUTO_START': () => null
});

export const VirtuinSagaResponseActions = createActions({
  'CONNECT_RESPONSE': (status) => ({ status }),
  'UP_RESPONSE': () => null,
  'RUN_RESPONSE': (groupIndex, taskIndex, status) => ({ taskIndex, groupIndex, status}),
  'DOWN_RESPONSE': () => null,
  'TASK_STATUS_RESPONSE': (taskStatus) => ({ taskStatus }),
  'SEND_DATA_RESPONSE': (groupIndex, taskIndex, status) => ({askIndex, groupIndex, status}),
  'BEGIN_TASKS_IF_AUTO_START_RESPONSE': () => null
})

const reducer = handleActions({
  [VirtuinSagaResponseActions.taskStatusResponse]: (state, { payload: { taskStatus } }) => ({...state, ...taskStatus})
}, defaultState);

export default reducer;