import { createActions, handleActions } from 'redux-actions';

const defaultState = {
  identifier: { groupIndex: 0, taskIndex: 0 },
};

export const { setTaskView } = createActions({
  SET_TASK_VIEW: identifier => ({ identifier })
});

const reducer = handleActions(
  {
    [setTaskView]: (state, { payload: { identifier } }) => ({ identifier })
  },
  defaultState
);

export default reducer;
