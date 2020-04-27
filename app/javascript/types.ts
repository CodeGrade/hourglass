export interface ExamState {
  [qnum: number]: {
    [pnum: number]: {
      [bnum: number]: AnswerState;
    }
  }
}

export type StatePath = Array<number | string>;

export interface Code {
  type: "Code";
  prompt: Array<string>;
  lang: string;

  // Full path to initial file.
  initial?: string;
}

export type CodeState = string;

export interface AllThatApply {
  type: "AllThatApply";
  options: Array<string>;
  prompt: Array<string>;
}

export interface AllThatApplyState {
  [index: number]: boolean;
}

export interface YesNo {
  type: "YesNo" | "TrueFalse";
  prompt: Array<string>;
}

export type YesNoState = boolean;

export interface CodeTag {
  type: "CodeTag";
  choices: "all" | "part" | "question";
}

export interface CodeTagState {
  // TODO
}

export interface MultipleChoice {
  type: "MultipleChoice";
  prompt: Array<string>; // (html)
  options: Array<string>; // (html)
}

export interface MultipleChoiceState {
  // TODO
}

export interface Text {
  type: "Text";
  prompt: Array<string>; // (html)
}

export type TextState = string;

export interface Matching {
  type: "Matching";
  promptLabel?: string; // (html)
  prompts: Array<string>; // (html)
  valuesLabel?: string;
  values: Array<string>;
}

export interface MatchingState {
  // TODO
}

export type BodyItem = HTML | AllThatApply | Code | YesNo | CodeTag | MultipleChoice | Text | Matching;

export type AnswerState = AllThatApplyState | CodeState | YesNoState | CodeTagState | MultipleChoiceState | TextState | MatchingState;

type HTML = {
  type: "HTML";
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
  type: "file";

  // The full path of the file.
  path: string;
}

export interface DirRef {
  type: "dir";

  // The full path of the directory.
  path: string;
}

// A tree of files, used in displaying treeview references.
export interface ExamSingleFile {
  filedir: "file";

  // Label for the file.
  text: string;

  // Path name of this file (no trailing slash)
  path: string;

  rel_path: string;

  // Sequential ID of this file.
  id: number;

  // The contents of the file.
  contents: string;

  // The CodeMirror type for this file.
  type: string;
}

export interface ExamDir {
  filedir: "dir";

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
  // File tree.
  files: Files;

  // Questions and their references.
  info: Exam;
}

