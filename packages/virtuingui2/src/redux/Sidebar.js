import { createActions, handleActions } from 'redux-actions';

const defaultState = {
  show: true
}

export const { toggleSidebar } = createActions({
  'TOGGLE_SIDEBAR': () => null
});

const reducer = handleActions({
  [toggleSidebar]: (state) => ({...state, show: !state.show})
}, defaultState);

export default reducer;