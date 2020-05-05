import {
  LockdownStatus,
  LockdownState,
  ExamTakerAction,
} from '@hourglass/types';

export default (state: LockdownState = {
  status: LockdownStatus.BEFORE,
  message: '',
}, action: ExamTakerAction): LockdownState => {
  switch (action.type) {
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
    default:
      return state;
  }
}
