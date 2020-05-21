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
  RailsExam,
  LockdownFailedAction,
  Thunk,
  policyPermits,
  UpdateScratchAction,
  ExamMessage,
  MessageReceivedAction,
  MessagesOpenedAction,
  AnswersState,
  Exam,
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
} from '@student/exams/show/types';
import {
  getCSRFToken,
  convertMsgs,
  convertQs,
} from '@student/exams/show/helpers';
import Routes from '@hourglass/routes';
import lock from '@student/exams/show/lockdown/lock';

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

export function askQuestion(examID: number, body: string): Thunk {
  return (dispatch, getState): void => {
    const qID = getState().questions.lastId + 1;
    dispatch(questionAsked(qID, body));
    const url = Routes.student_exam_ask_question_path(examID);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        message: {
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
  exam: Exam,
  answers: AnswersState,
  messages: ExamMessage[],
  questions: ProfQuestion[],
): LoadExamAction {
  return {
    type: 'LOAD_EXAM',
    exam,
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

export function doLoad(examID: number): Thunk {
  return (dispatch): void => {
    const url = Routes.student_exam_start_path(examID);
    fetch(url)
      .then((result) => result.json() as Promise<StartExamResponse>)
      .then((result) => {
        if (result.type === 'ANOMALOUS') {
          dispatch(lockdownFailed('You have been locked out. Please see an instructor.'));
        } else {
          const {
            exam,
            answers,
            messages,
            questions,
          } = result;
          const newMsgs = convertMsgs(messages);
          const newQs = convertQs(questions);
          dispatch(loadExam(exam, answers, newMsgs, newQs));
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
      if (policyPermits(exam.policies, Policy.ignoreLockdown)) {
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
    if (state.snapshot.status === SnapshotStatus.SUCCESS) {
      dispatch(snapshotSaving());
    }
    const { answers } = state.contents;
    // The messages list is sorted from newest to oldest.
    const lastMessageId = state.messages.messages[0]?.id ?? 0;
    const url = Routes.student_exam_save_snapshot_path(examID);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      body: JSON.stringify({
        answers,
        lastMessageId,
      }),
      credentials: 'same-origin',
    })
      .then((result) => result.json() as Promise<SnapshotSaveResult>)
      .then((result) => {
        const {
          lockout,
          messages,
        } = result;
        if (lockout) {
          const error = 'Locked out of exam.';
          dispatch(snapshotFailure(error));
          window.location = Routes.root_path();
        } else {
          const newMsgs = convertMsgs(messages);
          dispatch(snapshotSuccess());
          newMsgs.forEach((msg) => {
            dispatch(messageReceived(msg));
          });
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
    const url = Routes.student_exam_submit_path(examID);
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
        window.location = Routes.student_exam_path(examID);
      });
    // TODO: catch
  };
}
