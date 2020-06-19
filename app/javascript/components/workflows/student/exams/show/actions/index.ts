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
  RailsExamVersion,
  LockdownFailedAction,
  Thunk,
  policyPermits,
  UpdateScratchAction,
  ExamMessage,
  MessageReceivedAction,
  MessagesOpenedAction,
  AnswersState,
  ExamVersion,
  QuestionAskedAction,
  QuestionFailedAction,
  QuestionSucceededAction,
  ProfQuestion,
  SpyQuestionAction,
  PaginationCoordinates,
  PrevQuestionAction,
  NextQuestionAction,
  ActivateWaypointsAction,
  Policy,
  RailsCourse,
  TimeInfo,
} from '@student/exams/show/types';
import {
  getCSRFToken,
  convertMsgs,
  convertQs,
} from '@student/exams/show/helpers';
import lock from '@student/exams/show/lockdown/lock';
import { DateTime } from 'luxon';

export function questionAsked(id: number, body: string): QuestionAskedAction {
  return {
    type: 'QUESTION_ASKED',
    id,
    body,
  };
}

export function questionFailed(id: number): QuestionFailedAction {
  return {
    type: 'QUESTION_FAILED',
    id,
  };
}

export function questionSucceeded(id: number): QuestionSucceededAction {
  return {
    type: 'QUESTION_SUCCEEDED',
    id,
  };
}

export function askQuestion(courseID: number, examID: number, body: string): Thunk {
  return (dispatch, getState): void => {
    const qID = getState().questions.lastId + 1;
    dispatch(questionAsked(qID, body));
    const url = `/api/student/exams/${examID}/take`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        task: 'question',
        question: {
          body,
        },
      }),
    })
      .then((res) => res.json() as Promise<{success: boolean}>)
      .then((res) => {
        if (!res.success) {
          throw new Error('Problem saving question.');
        }
        dispatch(questionSucceeded(qID));
      })
      .catch((_reason) => {
        dispatch(questionFailed(qID));
      });
  };
}

export function messageReceived(msg: ExamMessage): MessageReceivedAction {
  return {
    type: 'MESSAGE_RECEIVED',
    msg,
  };
}

export function messagesOpened(): MessagesOpenedAction {
  return {
    type: 'MESSAGES_OPENED',
  };
}

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
  messages: {
    personal: ExamMessage[];
    room: ExamMessage[];
    version: ExamMessage[];
  },
  questions: ProfQuestion[],
): LoadExamAction {
  return {
    type: 'LOAD_EXAM',
    exam,
    time,
    answers,
    messages,
    questions,
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

export function doLoad(courseID: number, examID: number): Thunk {
  return (dispatch): void => {
    const url = `/api/student/exams/${examID}/take`;
    fetch(url, {
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
            messages,
            questions,
          } = result;
          const newTime: TimeInfo = {
            began: DateTime.fromISO(time.began),
            ends: DateTime.fromISO(time.ends),
          };
          const newMsgs = {
            personal: convertMsgs(messages.personal),
            room: convertMsgs(messages.room),
            version: convertMsgs(messages.version),
          };
          const newQs = convertQs(questions);
          dispatch(loadExam(exam, newTime, answers, newMsgs, newQs));
        }
      }).catch((err) => {
        // TODO: store a message to tell the user what went wrong
        dispatch(lockdownFailed(`Error starting exam: ${err.message}`));
      });
  };
}

export function doTryLockdown(
  course: RailsCourse,
  exam: RailsExamVersion,
): Thunk {
  return (dispatch): void => {
    lock(exam.policies).then(() => {
      window.history.pushState({}, document.title);
      if (policyPermits(exam.policies, Policy.ignoreLockdown)) {
        dispatch(lockdownIgnored());
      } else {
        dispatch(lockedDown());
      }
      dispatch(doLoad(course.id, exam.id));
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

export function saveSnapshot(courseID: number, examID: number): Thunk {
  return (dispatch, getState): void => {
    const state: ExamTakerState = getState();
    if (state.snapshot.status === SnapshotStatus.SUCCESS) {
      dispatch(snapshotSaving());
    }
    const { answers } = state.contents;
    // The messages list is sorted from newest to oldest.
    const lastMessageIds = {
      personal: state.messages.messages.personal[0]?.id ?? 0,
      room: state.messages.messages.room[0]?.id ?? 0,
      version: state.messages.messages.version[0]?.id ?? 0,
    };

    const url = `/api/student/exams/${examID}/take`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      body: JSON.stringify({
        task: 'snapshot',
        answers,
        lastMessageIds,
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
          messages,
        } = result;
        if (lockout) {
          const error = 'Locked out of exam.';
          dispatch(snapshotFailure(error));
          window.location.href = '/';
        } else {
          const newMsgs = {
            personal: convertMsgs(messages.personal),
            room: convertMsgs(messages.room),
            version: convertMsgs(messages.version),
          };
          dispatch(snapshotSuccess());
          [
            ...newMsgs.personal,
            ...newMsgs.room,
            ...newMsgs.version,
          ].forEach((msg) => {
            dispatch(messageReceived(msg));
          });
        }
      }).catch((err) => {
        const error = `Error saving snapshot to server: ${err.message}`;
        dispatch(snapshotFailure(error));
      });
  };
}

export function submitExam(courseID: number, examID: number): Thunk {
  return (_dispatch, getState): void => {
    const state = getState();
    const { answers } = state.contents;
    const url = `/api/student/exams/${examID}/take`;
    fetch(url, {
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
