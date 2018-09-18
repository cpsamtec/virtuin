import { SET_STATION } from '../types';

// eslint-disable-next-line import/prefer-default-export
export function setStation(station: {}) {
  return {
    type: SET_STATION,
    payload: { ...station }
  };
}
