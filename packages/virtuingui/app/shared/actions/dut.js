import { SET_DUT } from '../types';

export function setDut(dut: {}) {
  return {
    type: SET_DUT,
    payload: { ...dut }
  };
}
