import { createActions, handleActions } from 'redux-actions';

const defaultState = {
  notifications: [],
}

export const { addNotification, removeNotification } = createActions({
  'ADD_NOTIFICATION': notification => ({...notification, key: new Date().getTime() + Math.random()}),
  'REMOVE_NOTIFICATION': key => ({ key })
});


const reducer = handleActions({
  [addNotification]: (state, { payload: notification }) => ({...state, notifications: [...state.notifications, notification]}),
  [removeNotification]: (state, { payload: { key } }) => ({notifications: state.notifications.filter( notification => notification.key !== key)})
}, defaultState);

export default reducer;