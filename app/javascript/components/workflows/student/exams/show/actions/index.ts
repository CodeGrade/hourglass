import {
  LockedDownAction,
  LockdownIgnoredAction,
  TogglePaginationAction,
  ViewQuestionAction,
  ExamTakerState,
  SnapshotStatus,
  SnapshotFailure,
  SnapshotFinished,
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
import { getCSRFToken } from '@student/exams/show/helpers';
import { pluralize } from '@hourglass/common/helpers';

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
      .then(async (result) => {
        try {
          return await result.json() as Promise<StartExamResponse>;
        } catch (_e) {
          throw new Error(await result.text());
        }
      })
      .then((result) => {
        if (result.type === 'ANOMALOUS') {
          dispatch(lockdownFailed('You have been locked out. Please see an instructor.'));
        } else {
          const {
            time,
            exam,
            answers,
          } = result;
          // local time - server time
          const clockSkew = DateTime.local().diff(DateTime.fromISO(time.serverNow));
          const newTime: TimeInfo = {
            // server time + (local time - server time) ==> local time
            began: DateTime.fromISO(time.began).plus(clockSkew),
            ends: DateTime.fromISO(time.ends).plus(clockSkew),
            start: DateTime.fromISO(time.start).plus(clockSkew),
            stop: DateTime.fromISO(time.stop).plus(clockSkew),
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
      if (policyPermits(policies, 'IGNORE_LOCKDOWN')) {
        dispatch(lockdownIgnored());
      } else {
        dispatch(lockedDown());
      }
      dispatch(doLoad(examTakeUrl));
    }).catch((err) => {
      dispatch(lockdownFailed(err?.message ?? 'general failure'));
    });
  };
}

interface SubmitResponse {
  lockout: boolean;
}

function snapshotFinished(message: string): SnapshotFinished {
  return {
    type: 'SNAPSHOT_FINISHED',
    message,
  };
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

export function describeTime(time: DateTime): string {
  const remaining = DateTime.local().diff(time);
  const left = remaining.shiftTo('weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds').normalize();
  if (left.weeks > 0) {
    return `${pluralize(left.weeks, 'week', 'weeks')}, ${pluralize(left.days, 'day', 'days')} ago`;
  }
  if (left.days > 0) {
    return `${pluralize(left.days, 'day', 'days')}, ${pluralize(left.hours, 'hour', 'hours')} ago`;
  }
  if (left.hours > 0) {
    return `${pluralize(left.hours, 'hour', 'hours')}, ${pluralize(left.minutes, 'minute', 'minutes')} ago`;
  }
  if (left.minutes > 0) {
    return `${pluralize(left.minutes, 'minute', 'minutes')}, ${pluralize(left.seconds, 'second', 'seconds')} ago`;
  }
  if (left.valueOf() > 0) {
    return `${pluralize(left.seconds, 'second', 'seconds')} ago`;
  }
  return time.toRelative();
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
      .then(async (result) => {
        if (result.status === 403) {
          throw new Error('forbidden');
        }
        try {
          return await result.json() as Promise<SnapshotSaveResult>;
        } catch (_e) {
          throw new Error(await result.text());
        }
      })
      .then((result) => {
        if ('lockout' in result) {
          if (result.lockout) {
            const error = 'Locked out of exam.';
            dispatch(snapshotFailure(error));
            window.location.href = '/';
          } else {
            dispatch(snapshotSuccess());
          }
        } else {
          const { finished, message, lastSaved } = result;
          if (finished) {
            if (lastSaved) {
              const saved = DateTime.fromISO(lastSaved);
              const friendly = describeTime(saved);
              dispatch(snapshotFinished(`${message}  Your exam was saved ${friendly}.`));
            } else {
              dispatch(snapshotFinished(message));
            }
          } else {
            dispatch(snapshotFailure('Unknown error'));
          }
        }
      }).catch((err) => {
        const error = `Error saving snapshot to server: ${err.message}`;
        dispatch(snapshotFailure(error));
      });
  };
}

export function submitExam(examTakeUrl: string, cleanup: () => void): Thunk {
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
        cleanup();
        window.location.href = '/';
      })
      .catch(() => {
        cleanup();
        window.location.href = '/';
      });
  };
}
