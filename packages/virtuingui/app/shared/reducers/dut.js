// @flow
import { SET_DUT, DUTState, DUTAction } from '../types';

const initialState: DUTState = {
  SerialNumber: undefined,
  PartNumber: undefined
};

export default function dut(state: DUTState = initialState, action: DUTAction): DUTState {
  switch (action.type) {
    case SET_DUT: {
      return { ...state, ...action.payload };
    }
    default:
      return state;
  }
}
