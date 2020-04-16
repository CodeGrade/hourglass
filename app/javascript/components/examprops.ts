interface Code {
  type: "Code";
  prompt: Array<string>;
  lang: string;

  // Full path to initial file.
  initial?: string;
}

interface AllThatApply {
  type: "AllThatApply";
  options: Array<string>;
  prompt: Array<string>;
}

interface YesNo {
  type: "YesNo" | "TrueFalse";
  prompt: Array<string>;
}

interface CodeTag {
  type: "CodeTag";
  choices: "all" | "part" | "question";
}

interface MultipleChoice {
  type: "MultipleChoice";
  prompt: Array<string>; // (html)
  options: Array<string>; // (html)
}

interface Text {
  type: "Text";
  prompt: Array<string>; // (html)
}

interface Matching {
  type: "Matching";
  promptLabel?: string; // (html)
  prompts: Array<string>; // (html)
  valuesLabel?: string;
  values: Array<string>;
}

type BodyItem = HTML | AllThatApply | Code | YesNo | CodeTag | MultipleChoice | Text | Matching;

type HTML = {
  type: "HTML";
  value: string;
};

interface Part {
  name?: string;
  description: string;
  points: number;
  reference?: Array<FileRef>;
  body: Array<BodyItem>;
}

interface Question {
  name?: string;
  description: string;
  separateSubparts: boolean;
  parts: Array<Part>;
  reference?: Array<FileRef>;
}

interface Exam {
  questions: Array<Question>;
  reference?: Array<FileRef>;
  instructions: string;
}

type FileRef = SingleFileRef | DirRef;

interface SingleFileRef {
  type: "file";

  // The full path of the file.
  path: string;
}

interface DirRef {
  type: "dir";

  // The full path of the directory.
  path: string;
}

// A tree of files, used in displaying treeview references.
interface ExamSingleFile {
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

interface ExamDir {
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
type ExamFile = ExamSingleFile | ExamDir;

type Files = Array<ExamFile>;

// An exam object.
interface ExamInfo {
  // File tree.
  files: Files;

  // Questions and their references.
  info: Exam;
}
