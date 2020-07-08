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
  TimeInfo,
  RailsExamMessage,
  SetQuestionsAction,
} from '@student/exams/show/types';
import {
  getCSRFToken,
  convertMsgs,
  convertQs,
} from '@student/exams/show/helpers';
import lock from '@student/exams/show/lockdown/lock';
import { DateTime } from 'luxon';
import { getLatestMessages } from '@hourglass/common/api/student/exams/messages';
import { getAllQuestions } from '@hourglass/common/api/student/exams/questions';
import { HitApiError } from '@hourglass/common/types/api';

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

export function askQuestion(examQuestionsUrl: string, body: string): Thunk {
  return (dispatch, getState): void => {
    const qID = getState().questions.lastId + 1;
    dispatch(questionAsked(qID, body));
    fetch(examQuestionsUrl, {
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
    exam: ExamMessage[];
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
            exam: convertMsgs(messages.exam),
          };
          const newQs = convertQs(questions);
          dispatch(loadExam(exam, newTime, answers, newMsgs, newQs));
        }
      }).catch((err) => {
        dispatch(lockdownFailed(`Error starting exam: ${err.message}`));
      });
  };
}

export function doTryLockdown(
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
      dispatch(doLoad(exam.takeUrl));
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

function lastMessageId(messages: ExamMessage[]): number {
  return messages.reduce((newest, m) => (m.id > newest ? m.id : newest), 0);
}

function receiveMessages(
  messages: {
    personal: RailsExamMessage[];
    room: RailsExamMessage[];
    version: RailsExamMessage[];
    exam: RailsExamMessage[];
  },
): Thunk {
  return (dispatch): void => {
    const newMsgs = {
      personal: convertMsgs(messages.personal),
      room: convertMsgs(messages.room),
      version: convertMsgs(messages.version),
      exam: convertMsgs(messages.exam),
    };
    [
      ...newMsgs.personal,
      ...newMsgs.room,
      ...newMsgs.version,
      ...newMsgs.exam,
    ].forEach((msg) => {
      dispatch(messageReceived(msg));
    });
  };
}

export function setQuestions(questions: ProfQuestion[]): SetQuestionsAction {
  return {
    type: 'SET_QUESTIONS',
    questions,
  };
}

export function loadQuestions(
  examQuestionsUrl: string,
  onSuccess: () => void,
  onError: (err: HitApiError) => void,
): Thunk {
  return (dispatch): void => {
    getAllQuestions(examQuestionsUrl).then((res) => {
      dispatch(setQuestions(res.questions));
    }).then(() => onSuccess).catch(onError);
  };
}

export function loadMessages(
  examMessagesUrl: string,
  onSuccess: () => void,
  onError: (err: HitApiError) => void,
): Thunk {
  return (dispatch, getState): void => {
    const state: ExamTakerState = getState();
    const lastMessageIds = {
      personal: lastMessageId(state.messages.messages.personal),
      room: lastMessageId(state.messages.messages.room),
      version: lastMessageId(state.messages.messages.version),
      exam: lastMessageId(state.messages.messages.exam),
    };
    getLatestMessages(examMessagesUrl, lastMessageIds).then((res) => {
      dispatch(receiveMessages(res.messages));
    }).then(() => onSuccess()).catch(onError);
  };
}

export function saveSnapshot(examTakeUrl: string): Thunk {
  return (dispatch, getState): void => {
    const state: ExamTakerState = getState();
    if (state.snapshot.status === SnapshotStatus.SUCCESS) {
      dispatch(snapshotSaving());
    }
    const { answers } = state.contents;
    const lastMessageIds = {
      personal: lastMessageId(state.messages.messages.personal),
      room: lastMessageId(state.messages.messages.room),
      version: lastMessageId(state.messages.messages.version),
      exam: lastMessageId(state.messages.messages.exam),
    };

    fetch(examTakeUrl, {
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
          dispatch(receiveMessages(messages));
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
