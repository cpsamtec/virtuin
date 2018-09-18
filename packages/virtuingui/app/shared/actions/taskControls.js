import { createAliasedAction } from 'electron-redux';

export const TOGGLE_RUN_TASK = 'TOGGLE_RUN_TASK';

export const toggleRunTask = createAliasedAction(
  TOGGLE_RUN_TASK,
  () => ({
    type: TOGGLE_RUN_TASK,
    payload: {},
  })
);
