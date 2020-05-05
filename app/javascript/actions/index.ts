import {
  LockedDownAction,
  LockdownFailedAction,
  TogglePaginationAction,
  ViewQuestionAction,
  ExamTakerState,
  SnapshotFailure,
  SnapshotSuccess,
  SnapshotSaveResult,
  SnapshotSaving,
  AnswersState,
  StatePath,
  AnswerState,
  UpdateAnswerAction,
  ContentsData,
  LoadExamAction,
  RegistrationInfo,
  ExamInfo,
} from '@hourglass/types';
import { getCSRFToken } from '@hourglass/helpers';
import Routes from '@hourglass/routes';
import { lock } from '@hourglass/lockdown';

export function togglePagination(): TogglePaginationAction {
  return {
    type: 'TOGGLE_PAGINATION',
  };
}

export function viewQuestion(question: number, part?: number): ViewQuestionAction {
  return {
    type: 'VIEW_QUESTION',
    question,
    part: part ?? 0,
  };
}

export function viewNextQuestion() {
  return (dispatch, getState) => {
    const state: ExamTakerState = getState();
    const qnum = state.contents.pagination.selected.question;
    dispatch(viewQuestion(qnum+1, 0))
  };
}

export function viewPrevQuestion() {
  return (dispatch, getState) => {
    const state: ExamTakerState = getState();
    const qnum = state.contents.pagination.selected.question;
    dispatch(viewQuestion(qnum-1, 0))
  };
}

export function doTryLockdown(
  preview: boolean,
  exam: ExamInfo,
  registration: RegistrationInfo,
) {
  return (dispatch) => {
    lock(exam, registration).then(() => {
      dispatch(lockedDown());
      dispatch(doLoad(exam.id, preview));
    }).catch((err) => {
      dispatch(lockdownFailed(err.message));
    })
  };
}

export function lockedDown(): LockedDownAction {
  return {
    type: 'LOCKED_DOWN',
  };
}

export function lockdownFailed(message: string) {
  return {
    type: 'LOCKDOWN_FAILED',
    message,
  };
}

interface SubmitResponse {
  lockout: boolean;
}

export function submitExam(examID: number) {
  return (dispatch, getState) => {
    const state: ExamTakerState = getState();
    const { answers } = state.contents.data;
    dispatch(saveSnapshot(examID));
    const url = Routes.submit_exam_path(examID);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      credentials: 'same-origin',
    })
      .then(result => result.json() as Promise<SubmitResponse>)
      .then(result => {
        window.location = Routes.exam_path(examID);
      });
  }
}

export function loadExam(contents: ContentsData, preview: boolean): LoadExamAction {
  return {
    type: 'LOAD_EXAM',
    preview,
    contents,
  };
}

export function doLoad(examID: number, preview: boolean) {
  return (dispatch) => {
    const url = Routes.start_exam_path(examID);
    fetch(url)
      .then((result) => result.json() as Promise<ContentsData>)
      .then((result) => {
        dispatch(loadExam(result, preview));
      }).catch((err) => {
        // TODO: store a message to tell the user what went wrong
        console.error('Error starting exam', err);
      });
  };
}

export function updateAnswer(path: StatePath, val: AnswerState): UpdateAnswerAction {
  return {
    type: 'UPDATE_ANSWER',
    path,
    val,
  };
}

function snapshotFailure(message): SnapshotFailure {
  return {
    type: 'SNAPSHOT_FAILURE',
    message,
  };
}


function snapshotSuccess(): SnapshotSuccess {
  return {
    type: 'SNAPSHOT_SUCCESS',
  };
}

function snapshotSaving(): SnapshotSaving {
  return {
    type: 'SNAPSHOT_SAVING',
  };
}

export function saveSnapshot(examID) {
  return (dispatch, getState) => {
    const state: ExamTakerState = getState();
    const { answers } = state.contents.data;
    dispatch(snapshotSaving());
    const url = Routes.save_snapshot_exam_path(examID);
    fetch(url, {
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
        console.error('Snapshot save failure', err);
        const error = 'Error saving snapshot to server.';
        dispatch(snapshotFailure(error));
      });
  };
}
