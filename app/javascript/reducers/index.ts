import { combineReducers } from 'redux';
import {
  SnapshotStatus,
  ExamTakerState,
  ExamTakerAction,
} from '@hourglass/types';
import contentsReducer from './contents';
import snapshotReducer from './snapshot';

export default (state: ExamTakerState = {
  loaded: false,
  snapshot: undefined,
  contents: undefined,
}, action: ExamTakerAction): ExamTakerState => {
  switch (action.type) {
    case 'START_EXAM':
      return {
        ...state,
        loaded: true,
        contents: action.contents,
        snapshot: {
          status: action.preview ? SnapshotStatus.DISABLED : SnapshotStatus.SUCCESS,
          message: '',
        },
      };
    default:
      return {
        ...state,
        contents: (state.loaded
          ? contentsReducer(state.contents, action)
          : undefined),
        snapshot: snapshotReducer(state.snapshot, action),
      };
  }
}
