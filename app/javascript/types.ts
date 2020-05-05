import { ThunkAction } from 'redux-thunk';

export interface ExamInfo {
  // The exam ID.
  id: number;

  // The name of the exam.
  name: string;
}

export interface RegistrationInfo {
  id: number;
}

export type ExamTakerAction =
  LockedDownAction | LockdownFailedAction | LoadExamAction | ContentsAction | SnapshotAction;

export type Thunk = ThunkAction<void, ExamTakerState, unknown, ExamTakerAction>;

export type StartExamResponse = AnomalousReponse | ContentsData;

export interface AnomalousReponse {
  type: 'ANOMALOUS';
}

export interface ContentsData {
  type: 'CONTENTS';

  // Exam information.
  exam: ExamState;

  // The student's current answers.
  answers: AnswersState;
}

export interface ContentsState {
  loaded: boolean;

  data?: ContentsData;

  // Pagination information.
  pagination: PaginationState;
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

export interface LockedDownAction {
  type: 'LOCKED_DOWN';
}

export interface LockdownFailedAction {
  type: 'LOCKDOWN_FAILED';
  message: string;
}

export interface LoadExamAction {
  type: 'LOAD_EXAM';
  contents: ContentsData;
  preview: boolean;
}

export type ContentsAction = UpdateAnswerAction | TogglePaginationAction | ViewQuestionAction;

export interface UpdateAnswerAction {
  type: 'UPDATE_ANSWER';
  path: StatePath;
  val: AnswerState;
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
}

export interface LockdownState {
  // Last lockdown event.
  status: LockdownStatus;

  // Error message to display.
  message: string;
}

export interface ExamTakerState {
  // The current state of lockdown.
  lockdown: LockdownState;

  // The contents of the exam, and latest student answers.
  contents: ContentsState;

  // The current state of saving snapshots.
  snapshot: SnapshotState;
}

export interface User {
  username: string;
}

export enum SnapshotStatus {
  // The exam is in preview mode and snapshots are disabled.
  DISABLED = 'DISABLED',

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
}

export type StatePath = Array<number | string>;

export interface CodeInfo {
  type: 'Code';
  prompt: Array<string>;
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
  options: Array<string>;
  prompt: Array<string>;
}

export interface AllThatApplyState {
  [index: number]: boolean;
}

export interface YesNoInfo {
  type: 'YesNo' | 'TrueFalse';
  prompt: Array<string>;
}

export type YesNoState = boolean;

export interface CodeTagInfo {
  type: 'CodeTag';
  prompt: Array<string>;
  choices: Array<FileRef>;
}

export interface CodeTagState {
  selectedFile?: string;
  lineNumber: number;
}

export interface MultipleChoiceInfo {
  type: 'MultipleChoice';
  prompt: Array<string>; // (html)
  options: Array<string>; // (html)
}

export type MultipleChoiceState = number;

export interface TextInfo {
  type: 'Text';
  prompt: Array<string>; // (html)
}

export type TextState = string;

export interface MatchingInfo {
  type: 'Matching';
  promptLabel?: string; // (html)
  prompts: Array<string>; // (html)
  valuesLabel?: string;
  values: Array<string>;
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
  reference?: Array<FileRef>;
  body: Array<BodyItem>;
}

export interface QuestionInfo {
  name?: string;
  description: string;
  separateSubparts: boolean;
  parts: Array<PartInfo>;
  reference?: Array<FileRef>;
}

export interface ExamState {
  // File tree.
  files: ExamFile[];

  // Questions and their references.
  info: Exam;
}

export interface Exam {
  questions: Array<QuestionInfo>;
  reference?: Array<FileRef>;
  instructions: string;
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

  rel_path: string;

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

  rel_path: string;

  // Sequential ID of this directory.
  id: number;

  // Files within this directory.
  nodes: Array<ExamFile>;
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
