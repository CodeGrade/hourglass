import { AnswersState } from '../types';
import { SnapshotAction } from '../actions';

export interface SnapshotState {
  isLoading: boolean;
  success: boolean;
  message: string;
}

export function snapshot(state: SnapshotState = null, action: SnapshotAction): SnapshotState {
  switch (action.type) {
    case 'SNAPSHOT_LOADING':
      return {
        ...state,
        isLoading: true,
      };
    case 'SNAPSHOT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        success: true,
      };
    case 'SNAPSHOT_FAILURE':
      return {
        ...state,
        isLoading: false,
        success: false,
        message: action.message,
      };
    default:
      return state;
  }
}
