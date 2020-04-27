import { AnswersState, StatePath, AnswerState } from '../types';
import { Action as RAction } from 'redux';

export type Action = UpdateAnswerAction | LoadSnapshotAction;
export type SnapshotAction = SnapshotLoading | SnapshotSuccess | SnapshotFailure;

export interface UpdateAnswerAction {
  type: 'UPDATE_ANSWER';
  path: StatePath;
  val: AnswerState;
}

export interface LoadSnapshotAction {
  type: 'LOAD_SNAPSHOT';
  answers: AnswersState;
}

export function loadSnapshot() {
  return dispatch => {
    dispatch(snapshotLoading());
  };
}

export interface SnapshotLoading {
  type: 'SNAPSHOT_LOADING';
}

export function snapshotLoading(): SnapshotLoading {
  return {
    type: 'SNAPSHOT_LOADING',
  };
}

export interface SnapshotSuccess {
  type: 'SNAPSHOT_SUCCESS';
}

export interface SnapshotFailure {
  type: 'SNAPSHOT_FAILURE';
  message: string;
}

export function updateAnswer(path: StatePath, val: AnswerState): UpdateAnswerAction {
  return {
    type: 'UPDATE_ANSWER',
    path,
    val,
  };
}
