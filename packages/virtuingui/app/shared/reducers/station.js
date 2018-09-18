
import { SET_STATION, StationState, StationAction } from '../types';

const initialState: StationState = {
  name: 'N/A',
  user: undefined,
  brokerAddress: 'localhost'
};

function station(state: StationState = initialState, action: StationAction): StationState {
  switch (action.type) {
    case SET_STATION: {
      return { ...state, ...action.payload };
    }
    default:
      return state;
  }
}

export default station;
