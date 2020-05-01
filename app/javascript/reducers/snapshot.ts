import { SnapshotState, SnapshotStatus } from '@hourglass/types';
import { SnapshotAction } from '@hourglass/actions';

export function snapshot(state: SnapshotState = {
  disableControls: true,
  status: SnapshotStatus.LOADING,
  message: 'Waiting for first snapshot.',
}, action: SnapshotAction): SnapshotState {
  switch (action.type) {
    case 'SNAPSHOT_FETCHING':
      return {
        ...state,
        disableControls: true,
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
        disableControls: false,
        status: SnapshotStatus.SUCCESS,
      };
    case 'SNAPSHOT_FAILURE':
      return {
        ...state,
        disableControls: true,
        status: SnapshotStatus.FAILURE,
        message: action.message,
      };
    default:
      return state;
  }
}
