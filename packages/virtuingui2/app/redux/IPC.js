import { createActions } from 'redux-actions';

export const IPCSagaActions = createActions({
  'START_IPC': () => null,
  'STOP_IPC': () => null,
})