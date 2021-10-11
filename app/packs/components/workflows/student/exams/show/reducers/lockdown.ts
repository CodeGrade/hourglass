import {
  LockdownStatus,
  LockdownState,
  ExamTakerAction,
} from '@student/exams/show/types';

export default (state: LockdownState = {
  loaded: false,
  status: LockdownStatus.BEFORE,
  message: '',
}, action: ExamTakerAction): LockdownState => {
  switch (action.type) {
    case 'LOCKDOWN_IGNORED':
      return {
        ...state,
        status: LockdownStatus.IGNORED,
        message: '',
      };
    case 'LOCKED_DOWN':
      return {
        ...state,
        status: LockdownStatus.LOCKED,
        message: '',
      };
    case 'LOCKDOWN_FAILED':
      return {
        ...state,
        status: LockdownStatus.FAILED,
        message: action.message,
      };
    case 'LOAD_EXAM':
      return {
        ...state,
        loaded: true,
      };
    default:
      return state;
  }
};
