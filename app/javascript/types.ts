export interface User {
  username: string;
}

export interface ExamState {
  answers: AnswersState;
  snapshot: SnapshotState;
}

export enum SnapshotStatus {
  // Initial state. no snapshots have been taken yet.
  BEFORE = "BEFORE",

  // The exam is in preview mode and snapshots are disabled.
  DISABLED = "DISABLED",

  // A snapshot is being fetched from the server.
  LOADING = "LOADING",

  // The last snapshot was successfully fetched.
  SUCCESS = "SUCCESS",

  // The last snapshot fetch was not successful.
  FAILURE = "FAILURE",
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
    }
  }
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
  options: CodeMirror.TextMarkerOptions
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

export type BodyItem = HTML | AllThatApplyInfo | CodeInfo | YesNoInfo | CodeTagInfo | MultipleChoiceInfo | TextInfo | MatchingInfo;

export type AnswerState = AllThatApplyState | CodeState | YesNoState | CodeTagState | MultipleChoiceState | TextState | MatchingState;

type HTML = {
  type: 'HTML';
  value: string;
};

export interface Part {
  name?: string;
  description: string;
  points: number;
  reference?: Array<FileRef>;
  body: Array<BodyItem>;
}

export interface Question {
  name?: string;
  description: string;
  separateSubparts: boolean;
  parts: Array<Part>;
  reference?: Array<FileRef>;
}

export interface Exam {
  questions: Array<Question>;
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

export type Files = Array<ExamFile>;

// Map from file path to file.
export interface FileMap {
  [path: string]: ExamFile;
}

// An exam object.
export interface ExamInfo {
  // The exam ID.
  id: number;

  // File tree.
  files: Files;

  // Questions and their references.
  info: Exam;
}
