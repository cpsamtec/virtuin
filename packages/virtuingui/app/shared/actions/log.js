import { ADD_LOG_ENTRY, CLEAR_LOGS } from '../types';

const dateFormat = require('dateformat');

export function addLogEntry(log: {}) {
  return {
    type: ADD_LOG_ENTRY,
    payload: { ...log, timestamp: dateFormat(Date.now(), 'mm/dd/yy h:MM:ssTT') }
  };
}

export function clearLogs() {
  return {
    type: CLEAR_LOGS,
    payload: undefined
  };
}
