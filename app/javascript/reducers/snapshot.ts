import {
  ExamTakerAction,
  SnapshotState,
  SnapshotStatus,
} from '@hourglass/types';

export default function snapshot(state: SnapshotState = {
  status: SnapshotStatus.DISABLED,
  message: '',
}, action: ExamTakerAction): SnapshotState {
  switch (action.type) {
      case 'LOAD_EXAM':
      return {
        ...state,
        status: action.preview ? SnapshotStatus.DISABLED : SnapshotStatus.SUCCESS,
        message: '',
      };
    case 'SNAPSHOT_SAVING':
      return {
        ...state,
        status: SnapshotStatus.LOADING,
      };
    case 'SNAPSHOT_SUCCESS':
      return {
        ...state,
        status: SnapshotStatus.SUCCESS,
      };
    case 'SNAPSHOT_FAILURE':
      return {
        ...state,
        status: SnapshotStatus.FAILURE,
        message: action.message,
      };
    default:
      return state;
  }
}
