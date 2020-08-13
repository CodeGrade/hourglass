import {
  ExamTakerAction,
  SnapshotState,
  SnapshotStatus,
} from '@student/exams/show/types';

export default function snapshot(state: SnapshotState = {
  status: SnapshotStatus.LOADING,
  message: '',
}, action: ExamTakerAction): SnapshotState {
  switch (action.type) {
    case 'LOAD_EXAM':
      return {
        ...state,
        status: SnapshotStatus.SUCCESS,
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
    case 'SNAPSHOT_FINISHED':
      return {
        ...state,
        status: SnapshotStatus.FINISHED,
        message: action.message,
      };
    default:
      return state;
  }
}
