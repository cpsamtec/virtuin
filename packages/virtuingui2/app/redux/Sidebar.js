import { createActions, handleActions } from 'redux-actions';

const defaultState = {
  show: true,
  developerMode: false
}

export const { toggleSidebar, toggleDeveloper } = createActions({
  'TOGGLE_SIDEBAR': () => null,
  'TOGGLE_DEVELOPER': () => null,
});

const reducer = handleActions({
  [toggleSidebar]: (state) => ({...state, show: !state.show}),
  [toggleDeveloper]: (state) => ({...state, developerMode: !state.developerMode})
}, defaultState);

export default reducer;