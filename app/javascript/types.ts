import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { MapStateToProps } from 'react-redux';
import { DateTime } from 'luxon';

export interface RailsExam {
  // The exam ID.
  id: number;

  // The name of the exam.
  name: string;

  policies: Policy[];
}

export interface RailsRegistration {
  id: number;
}

export type ExamTakerAction =
  LoadExamAction |
  LockdownAction | PaginationAction | ContentsAction | SnapshotAction | MessagesAction;

export type Thunk = ThunkAction<void, ExamTakerState, unknown, ExamTakerAction>;
export type ExamTakerDispatch = ThunkDispatch<ExamTakerState, unknown, ExamTakerAction>;

export type MSTP<TStateProps, TOwnProps = {}> =
  MapStateToProps<TStateProps, TOwnProps, ExamTakerState>;

export type MDTP<TDispatchProps, TOwnProps = {}> =
  (dispatch: ExamTakerDispatch, ownProps: TOwnProps) => TDispatchProps;

export type StartExamResponse = AnomalousReponse | ContentsResponse;

export interface AnomalousReponse {
  type: 'ANOMALOUS';
}

export interface ContentsResponse {
  type: 'CONTENTS';

  exam: Exam;

  answers: AnswersState;

  messages: ProfMessage[];
}

export interface PaginationState {
  paginated: boolean;

  selected: {
    question: number;
    part?: number;
  };
}

export interface TogglePaginationAction {
  type: 'TOGGLE_PAGINATION';
}

export interface ViewQuestionAction {
  type: 'VIEW_QUESTION';
  question: number;
  part: number;
}

export type LockdownAction =
  LockedDownAction | LockdownFailedAction | LockdownIgnoredAction;

export interface LockdownIgnoredAction {
  type: 'LOCKDOWN_IGNORED';
}

export interface LockedDownAction {
  type: 'LOCKED_DOWN';
}

export interface LockdownFailedAction {
  type: 'LOCKDOWN_FAILED';
  message: string;
}

export interface LoadExamAction {
  type: 'LOAD_EXAM';
  exam: Exam;
  answers: AnswersState;
  messages: MessagesState;
}

export type ContentsAction = UpdateAnswerAction | UpdateScratchAction;

export type PaginationAction = TogglePaginationAction | ViewQuestionAction;

export interface UpdateAnswerAction {
  type: 'UPDATE_ANSWER';
  qnum: number;
  pnum: number;
  bnum: number;
  val: AnswerState;
}

export interface UpdateScratchAction {
  type: 'UPDATE_SCRATCH';
  val: string;
}

export interface SnapshotSaving {
  type: 'SNAPSHOT_SAVING';
}

export interface SnapshotSuccess {
  type: 'SNAPSHOT_SUCCESS';
}

export interface SnapshotFailure {
  type: 'SNAPSHOT_FAILURE';
  message: string;
}

export interface SnapshotSaveResult {
  lockout: boolean;
}

export type SnapshotAction = SnapshotSaving | SnapshotSuccess | SnapshotFailure;

export enum LockdownStatus {
  // Lockdown hasn't been requested yet.
  BEFORE = 'BEFORE',

  // Lockdown request failed.
  FAILED = 'FAILED',

  // Lockdown succeeded.
  LOCKED = 'LOCKED',

  // Lockdown ignored
  IGNORED = 'IGNORED',
}

export interface LockdownState {
  // Last lockdown event.
  status: LockdownStatus;

  // Error message to display.
  message: string;

  // Whether the exam has been loaded from the server.
  loaded: boolean;
}

export interface ContentsState {
  // Exam information.
  exam?: Exam;

  // The student's current answers.
  answers?: AnswersState;
}

export interface ExamTakerState {
  // The current state of lockdown.
  lockdown: LockdownState;

  // The exam and student answers.
  contents: ContentsState;

  // Pagination information.
  pagination: PaginationState;

  // Professor messages / anouncements.
  messages: MessagesState;

  // The current state of saving snapshots.
  snapshot: SnapshotState;
}

export type MessagesState = ProfMessage[];

export interface ProfMessage {
  body: string;

  time: DateTime;

  // Whether the message was sent directly to the current user.
  personal: boolean;
}

export type MessagesAction = MessageReceivedAction;

export interface MessageReceivedAction {
  type: 'MESSAGE_RECEIVED';
  msg: ProfMessage;
}

export interface RailsUser {
  username: string;
}

export enum SnapshotStatus {
  // A snapshot is being fetched from the server.
  LOADING = 'LOADING',

  // The last snapshot was successfully fetched.
  SUCCESS = 'SUCCESS',

  // The last snapshot fetch was not successful.
  FAILURE = 'FAILURE',
}

export interface SnapshotState {
  // status of network requests
  status: SnapshotStatus;

  // message to display with FAILURE status
  message: string;
}

export interface AnswersState {
  [qnum: number]: {
    [pnum: number]: {
      [bnum: number]: AnswerState;
    };
  };

  // The student's scratch space work.
  scratch: string;
}

export interface CodeInfo {
  type: 'Code';
  prompt: string[];
  lang: string;
  initial: string;
}

export interface MarkDescription {
  from: CodeMirror.Position;
  to: CodeMirror.Position;
  options: CodeMirror.TextMarkerOptions;
}

export type CodeState = {
  text: string;
  marks: MarkDescription[];
};

export interface AllThatApplyInfo {
  type: 'AllThatApply';
  options: string[];
  prompt: string[];
}

export interface AllThatApplyState {
  [index: number]: boolean;
}

export interface YesNoInfo {
  type: 'YesNo';
  yesLabel?: string;
  noLabel?: string;
  prompt: string[];
}

export type YesNoState = boolean;

export interface CodeTagInfo {
  type: 'CodeTag';
  prompt: string[];
  choices: FileRef[];
}

export interface CodeTagState {
  selectedFile?: string;
  lineNumber: number;
}

export interface MultipleChoiceInfo {
  type: 'MultipleChoice';
  prompt: string[]; // (html)
  options: string[]; // (html)
}

export type MultipleChoiceState = number;

export interface TextInfo {
  type: 'Text';
  prompt: string[]; // (html)
}

export type TextState = string;

export interface MatchingInfo {
  type: 'Matching';
  promptLabel?: string; // (html)
  prompts: string[]; // (html)
  valuesLabel?: string;
  values: string[];
}

export interface MatchingState {
  [index: number]: number;
}

export type BodyItem =
  HTML | AllThatApplyInfo | CodeInfo | YesNoInfo |
  CodeTagInfo | MultipleChoiceInfo | TextInfo | MatchingInfo;

export type AnswerState =
  AllThatApplyState | CodeState | YesNoState |
  CodeTagState | MultipleChoiceState | TextState | MatchingState;

type HTML = {
  type: 'HTML';
  value: string;
};

export interface PartInfo {
  name?: string;
  description: string;
  points: number;
  reference?: FileRef[];
  body: BodyItem[];
}

export interface QuestionInfo {
  name?: string;
  description: string;
  separateSubparts: boolean;
  parts: PartInfo[];
  reference?: FileRef[];
}

export interface Exam {
  questions: QuestionInfo[];
  reference?: FileRef[];
  instructions: string;
  files: ExamFile[];
}

export type FileRef = SingleFileRef | DirRef;

export interface SingleFileRef {
  type: 'file';

  // The full path of the file.
  path: string;
}

export interface DirRef {
  type: 'dir';

  // The full path of the directory.
  path: string;
}

// A tree of files, used in displaying treeview references.
export interface ExamSingleFile {
  filedir: 'file';

  // Label for the file.
  text: string;

  // Path name of this file (no trailing slash)
  path: string;

  relPath: string;

  // Sequential ID of this file.
  id: number;

  // The contents of the file.
  contents: string;

  // CodeMirror marks to apply
  marks: MarkDescription[];

  // The CodeMirror type for this file.
  type: string;
}

export interface ExamDir {
  filedir: 'dir';

  // Label for the directory (with trailing slash)
  text: string;

  // Path name of this directory (no trailing slash)
  path: string;

  relPath: string;

  // Sequential ID of this directory.
  id: number;

  // Files within this directory.
  nodes: ExamFile[];
}

// Exam files can be single files or directories.
export type ExamFile = ExamSingleFile | ExamDir;

// Map from file path to file.
export interface FileMap {
  [path: string]: ExamFile;
}

export type AnomalyDetected = (reason: string, event: Event) => void;

export interface AnomalyListener {
  event: string;
  handler: (e: Event) => void;
}

/**
 * Security policies:
 * - `'ignore-lockdown'`: don't install anomaly handlers
 * - `'tolerate-windowed'`: allow the browser to not be fullscreen
 */
export type Policy = 'ignore-lockdown' | 'tolerate-windowed';

export function policyPermits(policy: Policy[], query: Policy): boolean {
  return policy.find((p) => p === query) !== undefined;
}
