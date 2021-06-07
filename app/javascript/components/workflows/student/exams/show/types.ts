import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { MapStateToProps } from 'react-redux';
import { DateTime } from 'luxon';
import { editorQueryResponse } from '@professor/exams/new/editor/__generated__/editorQuery.graphql';
import { Policy } from '@material-ui/icons';

export type ExamTakerAction =
  LoadExamAction |
  LockdownAction |
  PaginationAction |
  ContentsAction |
  SnapshotAction;

export type Thunk = ThunkAction<void, ExamTakerState, unknown, ExamTakerAction>;
export type ExamTakerDispatch = ThunkDispatch<ExamTakerState, unknown, ExamTakerAction>;

export type MSTP<TStateProps, TOwnProps = Record<string, unknown>> =
  MapStateToProps<TStateProps, TOwnProps, ExamTakerState>;

export type MDTP<TDispatchProps, TOwnProps = Record<string, unknown>> =
  (dispatch: ExamTakerDispatch, ownProps: TOwnProps) => TDispatchProps;

export type StartExamResponse = AnomalousReponse | ContentsResponse;

export interface AnomalousReponse {
  type: 'ANOMALOUS';
}

export interface ContentsResponse {
  type: 'CONTENTS';

  time: RailsTimeInfo;

  exam: ExamVersion;

  answers: AnswersState;
}

export interface RailsExamQuestion {
  time: string;
  body: string;
  id: number;
}

export interface RailsExamMessage {
  time: string;
  body: string;
  type: ExamMessageType;
  id: number;
}

export interface PaginationCoordinates {
  question: number;
  part?: number;
}

export interface PaginationState {
  paginated: boolean;

  waypointsActive: boolean;

  spyCoords: PaginationCoordinates[];

  pageCoords: PaginationCoordinates[];

  // Index into pageCoords.
  page: number;

  // Index into spyCoords.
  spy: number;
}

export interface TogglePaginationAction {
  type: 'TOGGLE_PAGINATION';
}

export interface ViewQuestionAction {
  type: 'VIEW_QUESTION';
  coords: PaginationCoordinates;
}

export interface SpyQuestionAction {
  type: 'SPY_QUESTION';
  coords: PaginationCoordinates;
}

export interface PrevQuestionAction {
  type: 'PREV_QUESTION';
}

export interface NextQuestionAction {
  type: 'NEXT_QUESTION';
}

export interface ActivateWaypointsAction {
  type: 'ACTIVATE_WAYPOINTS';
  enabled: boolean;
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
  exam: ExamVersion;
  time: TimeInfo;
  answers: AnswersState;
}

export type ContentsAction = UpdateAnswerAction | UpdateScratchAction;

export type PaginationAction =
  TogglePaginationAction |
  ViewQuestionAction |
  SpyQuestionAction |
  PrevQuestionAction |
  NextQuestionAction |
  ActivateWaypointsAction;

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

export interface SnapshotFinished {
  type: 'SNAPSHOT_FINISHED';
  message: string;
}

export type SnapshotSaveResult = {
  lockout: boolean;
} | {
  finished: boolean;
  message: string;
  lastSaved: string;
};

export type SnapshotAction = SnapshotSaving | SnapshotSuccess | SnapshotFailure | SnapshotFinished;

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
  exam?: ExamVersion;

  // Exam timing information.
  time?: TimeInfo;

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

  // The current state of saving snapshots.
  snapshot: SnapshotState;
}

export type ExamMessageType = 'personal' | 'room' | 'version' | 'exam';

export interface ExamMessage {
  id: string;
  type: ExamMessageType;
  body: string;
  createdAt: DateTime;
}

export enum SnapshotStatus {
  // A snapshot is being fetched from the server.
  LOADING = 'LOADING',

  // The last snapshot was successfully fetched.
  SUCCESS = 'SUCCESS',

  // The last snapshot fetch was not successful.
  FAILURE = 'FAILURE',

  // The last snapshot fetch said the exam was finished.
  FINISHED = 'FINISHED',
}

export interface SnapshotState {
  // status of network requests
  status: SnapshotStatus;

  // message to display with FAILURE status
  message: string;
}

export interface AnswersState {
  // indices are [qnum][pnum][bnum]
  answers: AnswerState[][][];

  // The student's scratch space work.
  scratch: string;
}

export interface CodeInfo {
  type: 'Code';
  prompt: HTMLVal;
  lang: string;
  initial?: CodeInitial;
}

export type CodeInitial = CodeInitialFile | CodeInitialContents;

export interface CodeInitialFile {
  file: string;
}

export interface CodeInitialContents {
  text: string;

  // CodeMirror marks to apply
  marks: MarkDescription[];
}

export interface MarkDescription {
  from: CodeMirror.Position;
  to: CodeMirror.Position;
  options: {
    inclusiveLeft: CodeMirror.TextMarkerOptions['inclusiveLeft'];
    inclusiveRight: CodeMirror.TextMarkerOptions['inclusiveRight'];
  };
}

export type CodeState = {
  text: string;
  marks: MarkDescription[];
};

export interface HTMLVal {
  type: 'HTML';
  value: string;
}

export interface AllThatApplyInfo {
  type: 'AllThatApply';
  options: HTMLVal[];
  prompt: HTMLVal;
}

export type AllThatApplyState = boolean[];

export interface YesNoInfo {
  type: 'YesNo';
  yesLabel: string;
  noLabel: string;
  prompt: HTMLVal;
}

export type YesNoState = boolean;

export interface CodeTagInfo {
  type: 'CodeTag';
  prompt: HTMLVal;
  choices: 'exam' | 'question' | 'part';
}

export interface CodeTagState {
  selectedFile?: string;
  lineNumber: number;
}

export interface MultipleChoiceInfo {
  type: 'MultipleChoice';
  prompt: HTMLVal;
  options: HTMLVal[];
}

export type MultipleChoiceState = number;

export interface TextInfo {
  type: 'Text';
  prompt: HTMLVal;
}

export type TextState = string;

export interface MatchingInfo {
  type: 'Matching';
  prompt: HTMLVal;
  promptsLabel?: HTMLVal;
  prompts: HTMLVal[];
  valuesLabel?: HTMLVal;
  values: HTMLVal[];
}

export type MatchingState = number[];

export type BodyItemInfo =
  HTMLVal | AllThatApplyInfo | CodeInfo | YesNoInfo |
  CodeTagInfo | MultipleChoiceInfo |
  TextInfo | MatchingInfo;

export interface BodyItem {
  id: string;
  info: BodyItemInfo;
}

export type AnswerState =
  AllThatApplyState | CodeState | YesNoState |
  CodeTagState | MultipleChoiceState | TextState | MatchingState |
  NoAnswerState;

export interface NoAnswerState {
  NO_ANS: true;
}

export interface PartInfo {
  name?: HTMLVal;
  description?: HTMLVal;
  points: number;
  extraCredit?: boolean;
  references?: readonly FileRef[];
  bodyItems: readonly BodyItem[];
}

export interface QuestionInfo {
  name?: HTMLVal;
  description?: HTMLVal;
  extraCredit?: boolean;
  separateSubparts: boolean;
  parts: readonly PartInfo[];
  references?: readonly FileRef[];
}

export interface RailsTimeInfo {
  serverNow: string
  began: string;
  ends: string;
  start: string;
  stop: string;
}

export interface TimeInfo {
  // when the exam period began (including accommodation)
  began: DateTime;
  // when the exam period ends (including accommodation)
  ends: DateTime;
  // when student started their exam
  start: DateTime;
  // when student must stop
  stop: DateTime;
}

export interface ExamVersion {
  questions: readonly QuestionInfo[];
  references?: readonly FileRef[];
  instructions?: HTMLVal;
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

  // path relative to root
  relPath: string;

  // Filename
  path: string;

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

  // Dirname
  path: string;

  // path relative to root
  relPath: string;

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
  capture?: boolean;
}

export type Policy = editorQueryResponse['examVersion']['policies'][number];

export function policyPermits(policy: readonly Policy[], query: Policy): boolean {
  return policy.find((p) => p === query) !== undefined;
}
