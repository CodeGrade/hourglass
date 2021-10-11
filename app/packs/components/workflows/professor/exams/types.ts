import {
  CodeInfo,
  CodeState,
  HTMLVal,
  AllThatApplyInfo,
  YesNoInfo,
  YesNoState,
  CodeTagInfo,
  CodeTagState,
  MultipleChoiceInfo,
  MultipleChoiceState,
  TextInfo,
  TextState,
  QuestionInfo,
  PartInfo,
  MatchingInfo,
  ExamVersion,
  NoAnswerState,
} from '@student/exams/show/types';

export function assertType<T>(isT: (val: unknown) => val is T, val: unknown): T {
  if (isT(val)) return val;
  throw new Error("value doesn't meet its type specification");
}

interface GradingCheck {
  points: number;
  grader: string;
}

export interface CommentJson {
  id: string;
  qnum: number;
  pnum: number;
  bnum: number;
  grader: string;
  points: number;
  message: string;
}
interface PresetCommentInfo {
  id: string;
  label: string;
  points: number;
}
export interface PresetCommentsJson {
  type: 'preset_comment';
  info: PresetCommentInfo;
  values: CommentJson[];
}
interface RubricPresetInfo {
  id: string;
  label: string;
  direction: 'credit' | 'deduction';
  mercy?: number;
}
export interface RubricPresetJson {
  type: 'rubric_preset';
  info: RubricPresetInfo;
  values: {
    [id: string]: PresetCommentsJson;
  }
}
interface RubricInfo {
  id: string;
  points?: number;
  qnum?: number;
  pnum?: number;
  bnum?: number;
  description: string;
}
export interface RubricJson {
  type?: 'any' | 'all' | 'one' | 'none';
  info?: RubricInfo;
  values: {
    [id: string]: (RubricJson | RubricPresetJson);
  }
}
export interface GroupedGradingComment {
  [id: string]: RubricJson;
}

export interface CurrentGrading {
  [qnum: number]: {
    [pnum: number]: {
      score: number;
      graded: boolean;
      inProgress: boolean;
      body: {
        checks: GradingCheck[];
        grouped: GroupedGradingComment;
      }[];
    }
  }
}

// export type GradingComments = {
//   [qnum: number]: {
//     [pnum: number]: {
//       [bnum: number]: {
//         comments: {
//           grader: string;
//           message: string;
//           points: number;
//         }[];
//         checks: {
//           grader: string;
//           points: number;
//         }[];
//       };
//     };
//   };
// };

export interface CodeInfoWithAnswer extends CodeInfo {
  answer: CodeState;
}

export interface AllThatApplyOptionWithAnswer {
  html: HTMLVal;
  answer: boolean;
}

export interface AllThatApplyInfoWithAnswer extends Omit<AllThatApplyInfo, 'options'> {
  options: AllThatApplyOptionWithAnswer[];
}
export interface YesNoInfoWithAnswer extends YesNoInfo {
  answer?: YesNoState;
}
export interface CodeTagInfoWithAnswer extends CodeTagInfo {
  answer?: CodeTagState;
}

export interface MatchingPromptWithAnswer {
  html: HTMLVal;
  answer: number;
}

export interface MatchingInfoWithAnswer extends Omit<MatchingInfo, 'prompts'> {
  prompts: MatchingPromptWithAnswer[];
}

export interface MultipleChoiceInfoWithAnswer extends MultipleChoiceInfo {
  answer?: MultipleChoiceState;
}

export interface TextInfoWithAnswer extends TextInfo {
  answer: TextState;
}

export type BodyItemWithAnswer =
  HTMLValWithAnswer | AllThatApplyInfoWithAnswer | CodeInfoWithAnswer | YesNoInfoWithAnswer |
  CodeTagInfoWithAnswer | MultipleChoiceInfoWithAnswer |
  TextInfoWithAnswer | MatchingInfoWithAnswer;

export interface HTMLValWithAnswer extends HTMLVal {
  answer: NoAnswerState;
}

export interface PartInfoWithAnswers extends Omit<PartInfo, 'bodyItems'> {
  bodyItems: BodyItemWithAnswer[];
}

export interface QuestionInfoWithAnswers extends Omit<QuestionInfo, 'parts'> {
  parts: PartInfoWithAnswers[];
}

export interface ExamVersionWithAnswers extends Omit<ExamVersion, 'questions'> {
  questions: QuestionInfoWithAnswers[];
}

export interface BodyRubric {
  rubric?: Rubric;
}

type GradingComment = string;

export type Preset = {
  id: string;
  label?: string;
  graderHint: GradingComment;
  studentFeedback?: GradingComment;
  points: number;
  inUse?: boolean;
}

export type RubricPresets = {
  id: string;
  label?: string;
  direction: 'credit' | 'deduction';
  mercy?: number;
  presets: Preset[];
  inUse?: boolean;
}

type Editable<T, editable extends string> = {
  [P in keyof T]: P extends editable ? (T[P] | string) : Editable<T[P], editable>
}

export type EditablePreset = Editable<Preset, 'points'>

export type EditableRubricPresets = Editable<RubricPresets, 'points'>

export type Rubric = RubricAll | RubricAny | RubricOne | RubricNone;

export type RubricNone = {
  type: 'none';
  id: string;
  inUse?: boolean;
}

export type RubricAll = {
  type: 'all';
  id: string;
  description?: HTMLVal;
  choices: Rubric[] | RubricPresets;
  inUse?: boolean;
}

export type RubricAny = {
  type: 'any';
  id: string;
  points: number;
  description?: HTMLVal;
  choices: Rubric[] | RubricPresets;
  inUse?: boolean;
}

export type RubricOne = {
  type: 'one';
  id: string;
  points: number;
  description?: HTMLVal;
  choices: Rubric[] | RubricPresets;
  inUse?: boolean;
}

export type BodyItemRubric = {
  id: string;
  rubric: Rubric
};

export type PartRubric = {
  id: string;
  partRubric: Rubric;
  body: BodyItemRubric[];
}

export type QuestionRubric = {
  id: string;
  questionRubric: Rubric;
  parts: PartRubric[];
}

export type ExamRubric = {
  examRubric: Rubric;
  questions: QuestionRubric[];
}
