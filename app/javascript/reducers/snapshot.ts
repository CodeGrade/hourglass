import { SnapshotState, SnapshotStatus } from '@hourglass/types';
import { SnapshotAction } from '@hourglass/actions';

export function snapshot(state: SnapshotState = {
  status: SnapshotStatus.BEFORE,
  message: 'Waiting for first snapshot.',
}, action: SnapshotAction): SnapshotState {
  switch (action.type) {
    case 'SNAPSHOT_DISABLE':
      return {
        ...state,
        status: SnapshotStatus.DISABLED,
        message: 'Exam in preview mode.',
      };
    case 'SNAPSHOT_FETCHING':
      return {
        ...state,
        status: SnapshotStatus.LOADING,
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
