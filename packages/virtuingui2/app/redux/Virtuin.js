import { createActions, handleActions } from 'redux-actions';

const defaultState = {
  collectionState: 'Loaded',
  statusMessage: 'hi',
  logMessage: 'uhh',
  callbacks: {},
  stdout: 'stdout',
  stderr: 'stderr',
  groups: [
    {
      name: 'Task Group 0',
      description: 'Here is task group 0 des',
      
      mode: 'sequential',
      autoStart: true,
      tasksStatus: [
        {
          name: 'Task 0',
          description: 'here is the task description',
          progress: 63,
          identifier: {groupIndex: 0, taskIndex: 0},
          state: 'KILLED',
          autoStart: true,
          taskUUID: "1232132",
          error: null,
          viewURL: 'http://localhost:3000',
          startDate: 'now',
          completeDate: 'tomorrow',
          messages: ['hi', 'hola'],
          stdout: 'huh',
          stderr: ''
        }, {
          name: 'Task 1',
          description: 'here is the task description',
          progress: 32,
          identifier: {groupIndex: 0, taskIndex: 1},
          state: 'KILLED',
          autoStart: true,
          taskUUID: "1232132",
          error: null,
          viewURL: 'http://localhost:3000',
          startDate: 'now',
          completeDate: 'tomorrow',
          messages: ['hi', 'hola'],
          stdout: 'huh',
          stderr: ''
        }
      ] 
      
    }
  ]
}
export const VirtuinSagaActions = createActions({
  'CONNECT': () => null,
  'UP': () => null,
  'RUN': (groupIndex, taskIndex ) => ({groupIndex, taskIndex}),
  'DOWN': () => null,
});

export const VirtuinSagaResponseActions = createActions({
  'CONNECT_RESPONSE': (status) => ({ status }),
  'UP_RESPONSE': () => null,
  'RUN_RESPONSE': (groupIndex, taskIndex, status) => ({ taskIndex, groupIndex, status}),
  'DOWN_RESPONSE': () => null,
  'TASK_STATUS_RESPONSE': (taskStatus) => ({ taskStatus })
})

const reducer = handleActions({
  [VirtuinSagaResponseActions.taskStatusResponse]: (state, { payload: { taskStatus } }) => ({...state, ...taskStatus})
}, defaultState);

export default reducer;