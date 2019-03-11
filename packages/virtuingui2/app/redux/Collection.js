import { createActions, handleActions } from 'redux-actions';


const defaultState = {
};

export const { setCollectionDef } = createActions({
  'SET_COLLECTION_DEF': (collectionDef) => ({ collectionDef }),
});

const reducer = handleActions({
  [setCollectionDef]: (state, {payload: { collectionDef }}) => ({ ...collectionDef })
}, defaultState);

export default reducer;