import { AnswersState, StatePath, AnswerState } from '../types';

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

function loadSnapshotAction(answers: AnswersState) {
  return {
    type: 'LOAD_SNAPSHOT',
    answers,
  };
}

interface SnapshotLoadResult {
  answers: AnswersState;
}

export function loadSnapshot() {
  return (dispatch) => {
    dispatch(snapshotLoading());
    fetch(`${document.URL}/get_snapshot`)
      .then((result) => result.json() as Promise<SnapshotLoadResult>)
      .then((result) => {
        const { answers } = result;
        dispatch(loadSnapshotAction(answers));
        dispatch(snapshotSuccess());
      }).catch((err) => {
        dispatch(snapshotFailure(String(err)));
      });
  };
}

interface SnapshotSaveResult {
  lockout: boolean;
}

function getCSRFToken(): string {
  const elem: HTMLMetaElement = document.querySelector('[name=csrf-token]');
  return elem.content;
}

export function saveSnapshot() {
  return (dispatch, getState) => {
    const { answers } = getState();
    dispatch(snapshotLoading());
    fetch(`${document.URL}/save_snapshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      body: JSON.stringify({ answers }),
      credentials: 'same-origin',
    })
      .then((result) => result.json() as Promise<SnapshotSaveResult>)
      .then((result) => {
        const { lockout } = result;
        console.log('lockout: ', lockout);
        dispatch(snapshotSuccess());
      }).catch((err) => {
        dispatch(snapshotFailure(String(err)));
      });
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

function snapshotSuccess() {
  return {
    type: 'SNAPSHOT_SUCCESS',
  };
}

export interface SnapshotFailure {
  type: 'SNAPSHOT_FAILURE';
  message: string;
}

function snapshotFailure(message) {
  return {
    type: 'SNAPSHOT_FAILURE',
    message,
  };
}

export function updateAnswer(path: StatePath, val: AnswerState): UpdateAnswerAction {
  return {
    type: 'UPDATE_ANSWER',
    path,
    val,
  };
}
