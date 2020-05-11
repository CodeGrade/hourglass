import {
  LockedDownAction,
  LockdownIgnoredAction,
  TogglePaginationAction,
  ViewQuestionAction,
  ExamTakerState,
  SnapshotFailure,
  SnapshotSuccess,
  SnapshotSaveResult,
  SnapshotSaving,
  AnswerState,
  UpdateAnswerAction,
  StartExamResponse,
  LoadExamAction,
  RailsExam,
  LockdownFailedAction,
  Thunk,
  policyPermits,
  UpdateScratchAction,
  ExamMessage,
  MessageReceivedAction,
  MessagesState,
  AnswersState,
  Exam,
} from '@hourglass/types';
import { getCSRFToken } from '@hourglass/helpers';
import Routes from '@hourglass/routes';
import lock from '@hourglass/lockdown/lock';
import { DateTime } from 'luxon';

export function messageReceived(msg: ExamMessage): MessageReceivedAction {
  return {
    type: 'MESSAGE_RECEIVED',
    msg,
  };
}

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

export function viewNextQuestion(): Thunk {
  return (dispatch, getState): void => {
    const state = getState();
    const qnum = state.pagination.selected.question;
    dispatch(viewQuestion(qnum + 1, 0));
  };
}

export function viewPrevQuestion(): Thunk {
  return (dispatch, getState): void => {
    const state = getState();
    const qnum = state.pagination.selected.question;
    dispatch(viewQuestion(qnum - 1, 0));
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
  exam: Exam,
  answers: AnswersState,
  messages: MessagesState,
): LoadExamAction {
  return {
    type: 'LOAD_EXAM',
    exam,
    answers,
    messages,
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

export function doLoad(examID: number): Thunk {
  return (dispatch): void => {
    const url = Routes.start_exam_path(examID);
    fetch(url)
      .then((result) => result.json() as Promise<StartExamResponse>)
      .then((result) => {
        if (result.type === 'ANOMALOUS') {
          dispatch(lockdownFailed('You have been locked out. Please see an instructor.'));
        } else {
          const { exam, answers, messages } = result;
          const newMsgs = messages.map((m) => ({
            ...m,
            time: DateTime.fromISO(m.time),
          }));
          dispatch(loadExam(exam, answers, newMsgs));
        }
      }).catch((err) => {
        // TODO: store a message to tell the user what went wrong
        dispatch(lockdownFailed(`Error starting exam: ${err.message}`));
      });
  };
}

export function doTryLockdown(
  exam: RailsExam,
): Thunk {
  return (dispatch): void => {
    lock(exam.policies).then(() => {
      if (policyPermits(exam.policies, 'ignore-lockdown')) {
        dispatch(lockdownIgnored());
      } else {
        dispatch(lockedDown());
      }
      dispatch(doLoad(exam.id));
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

export function saveSnapshot(examID: number): Thunk {
  return (dispatch, getState): void => {
    const state: ExamTakerState = getState();
    const { answers } = state.contents;
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
        if (lockout) {
          const error = 'Locked out of exam.';
          dispatch(snapshotFailure(error));
          window.location = Routes.exams_path();
        } else {
          dispatch(snapshotSuccess());
        }
      }).catch((err) => {
        const error = `Error saving snapshot to server: ${err.message}`;
        dispatch(snapshotFailure(error));
      });
  };
}

export function submitExam(examID: number): Thunk {
  return (dispatch, getState): void => {
    const state = getState();
    const { answers } = state.contents;
    dispatch(saveSnapshot(examID));
    const url = Routes.submit_exam_path(examID);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        answers,
      }),
    })
      .then((result) => result.json() as Promise<SubmitResponse>)
      .then(() => {
        window.location = Routes.exam_path(examID);
      });
    // TODO: catch
  };
}
