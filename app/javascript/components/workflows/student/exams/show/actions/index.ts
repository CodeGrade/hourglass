import {
  LockedDownAction,
  LockdownIgnoredAction,
  TogglePaginationAction,
  ViewQuestionAction,
  ExamTakerState,
  SnapshotStatus,
  SnapshotFailure,
  SnapshotSuccess,
  SnapshotSaveResult,
  SnapshotSaving,
  AnswerState,
  UpdateAnswerAction,
  StartExamResponse,
  LoadExamAction,
  LockdownFailedAction,
  Thunk,
  policyPermits,
  UpdateScratchAction,
  AnswersState,
  ExamVersion,
  SpyQuestionAction,
  PaginationCoordinates,
  PrevQuestionAction,
  NextQuestionAction,
  ActivateWaypointsAction,
  Policy,
  TimeInfo,
} from '@student/exams/show/types';
import lock from '@student/exams/show/lockdown/lock';
import { DateTime } from 'luxon';
import { getCSRFToken } from '../helpers';

export function togglePagination(): TogglePaginationAction {
  return {
    type: 'TOGGLE_PAGINATION',
  };
}

export function viewQuestion(coords: PaginationCoordinates): ViewQuestionAction {
  return {
    type: 'VIEW_QUESTION',
    coords,
  };
}

export function spyQuestion(coords: PaginationCoordinates): SpyQuestionAction {
  return {
    type: 'SPY_QUESTION',
    coords,
  };
}

export function prevQuestion(): PrevQuestionAction {
  return {
    type: 'PREV_QUESTION',
  };
}

export function nextQuestion(): NextQuestionAction {
  return {
    type: 'NEXT_QUESTION',
  };
}

export function activateWaypoints(enabled: boolean): ActivateWaypointsAction {
  return {
    type: 'ACTIVATE_WAYPOINTS',
    enabled,
  };
}

export function lockedDown(): LockedDownAction {
  return {
    type: 'LOCKED_DOWN',
  };
}

export function lockdownIgnored(): LockdownIgnoredAction {
  return {
    type: 'LOCKDOWN_IGNORED',
  };
}

export function lockdownFailed(message: string): LockdownFailedAction {
  return {
    type: 'LOCKDOWN_FAILED',
    message,
  };
}

export function loadExam(
  exam: ExamVersion,
  time: TimeInfo,
  answers: AnswersState,
): LoadExamAction {
  return {
    type: 'LOAD_EXAM',
    exam,
    time,
    answers,
  };
}

export function updateAnswer(
  qnum: number,
  pnum: number,
  bnum: number,
  val: AnswerState,
): UpdateAnswerAction {
  return {
    type: 'UPDATE_ANSWER',
    qnum,
    pnum,
    bnum,
    val,
  };
}

export function updateScratch(val: string): UpdateScratchAction {
  return {
    type: 'UPDATE_SCRATCH',
    val,
  };
}

export function doLoad(examTakeUrl: string): Thunk {
  return (dispatch): void => {
    fetch(examTakeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        task: 'start',
      }),
    })
      .then((result) => result.json() as Promise<StartExamResponse>)
      .then((result) => {
        if (result.type === 'ANOMALOUS') {
          dispatch(lockdownFailed('You have been locked out. Please see an instructor.'));
        } else {
          const {
            time,
            exam,
            answers,
          } = result;
          const newTime: TimeInfo = {
            began: DateTime.fromISO(time.began),
            ends: DateTime.fromISO(time.ends),
          };
          dispatch(loadExam(exam, newTime, answers));
        }
      }).catch((err) => {
        dispatch(lockdownFailed(`Error starting exam: ${err.message}`));
      });
  };
}

export function doTryLockdown(
  policies: readonly Policy[],
  examTakeUrl: string,
): Thunk {
  return (dispatch): void => {
    lock(policies).then(() => {
      window.history.pushState({}, document.title);
      if (policyPermits(policies, Policy.ignoreLockdown)) {
        dispatch(lockdownIgnored());
      } else {
        dispatch(lockedDown());
      }
      dispatch(doLoad(examTakeUrl));
    }).catch((err) => {
      dispatch(lockdownFailed(err.message));
    });
  };
}

interface SubmitResponse {
  lockout: boolean;
}

function snapshotFailure(message: string): SnapshotFailure {
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

export function saveSnapshot(examTakeUrl: string): Thunk {
  return (dispatch, getState): void => {
    const state: ExamTakerState = getState();
    if (state.snapshot.status === SnapshotStatus.SUCCESS) {
      dispatch(snapshotSaving());
    }
    const { answers } = state.contents;

    fetch(examTakeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      body: JSON.stringify({
        task: 'snapshot',
        answers,
      }),
      credentials: 'same-origin',
    })
      .then((result) => {
        if (result.status === 403) {
          throw new Error('forbidden');
        }
        return result.json() as Promise<SnapshotSaveResult>;
      })
      .then((result) => {
        const {
          lockout,
        } = result;
        if (lockout) {
          const error = 'Locked out of exam.';
          dispatch(snapshotFailure(error));
          window.location.href = '/';
        } else {
          dispatch(snapshotSuccess());
        }
      }).catch((err) => {
        const error = `Error saving snapshot to server: ${err.message}`;
        dispatch(snapshotFailure(error));
      });
  };
}

export function submitExam(examTakeUrl: string): Thunk {
  return (_dispatch, getState): void => {
    const state = getState();
    const { answers } = state.contents;
    fetch(examTakeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        task: 'submit',
        answers,
      }),
    })
      .then((result) => result.json() as Promise<SubmitResponse>)
      .then(() => {
        window.location.href = '/';
      });
    // TODO: catch
  };
}
