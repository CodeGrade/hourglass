import {
  CodeInfo,
  CodeState,
  HTMLVal,
  NoAnswerState,
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
} from '@student/exams/show/types';

export function assertType<T>(isT: (val: unknown) => val is T, val: unknown): T {
  if (isT(val)) return val;
  throw new Error("value doesn't meet its type specification");
}

function maybe<T>(isT: (val: unknown) => val is T): (val: unknown) => val is T {
  return (val: unknown): val is T => (val === undefined || isT(val));
}
function array<T>(isT: (val: unknown) => val is T): (val: unknown) => val is T[] {
  return (val: unknown): val is T[] => (val instanceof Array) && val.every(isT);
}

interface GradingCheck {
  points: number;
  grader: string;
}

export interface CommentJson {
  railsId: string;
  qnum: number;
  pnum: number;
  bnum: number;
  grader: string;
  points: number;
  message: string;
}
interface PresetCommentInfo {
  railsId: string;
  label: string;
  points: number;
}
export interface PresetCommentsJson {
  type: 'preset_comment';
  info: PresetCommentInfo;
  values: CommentJson[];
}
interface RubricPresetInfo {
  railsId: number;
  label: string;
  direction: 'credit' | 'deduction';
  mercy?: number;
}
export interface RubricPresetJson {
  type: 'rubric_preset';
  info: RubricPresetInfo;
  values: {
    [railsId: string]: PresetCommentsJson;
  }
}
interface RubricInfo {
  railsId: string;
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
    [railsId: string]: (RubricJson | RubricPresetJson);
  }
}
export interface GroupedGradingComment {
  [railsId: string]: RubricJson;
}

export interface CurrentGrading {
  [qnum: number]: {
    [pnum: number]: {
      score: number;
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
  rubric?: Rubric;
}

export interface HTMLValWithAnswer extends HTMLVal {
  answer: NoAnswerState;
  rubric?: Rubric;
}

export interface AllThatApplyOptionWithAnswer {
  html: HTMLVal;
  answer: boolean;
}

export interface AllThatApplyInfoWithAnswer extends Omit<AllThatApplyInfo, 'options'> {
  options: AllThatApplyOptionWithAnswer[];
  rubric?: Rubric;
}
export interface YesNoInfoWithAnswer extends YesNoInfo {
  answer?: YesNoState;
  rubric?: Rubric;
}
export interface CodeTagInfoWithAnswer extends CodeTagInfo {
  answer?: CodeTagState;
  rubric?: Rubric;
}

export interface MatchingPromptWithAnswer {
  html: HTMLVal;
  answer: number;
}

export interface MatchingInfoWithAnswer extends Omit<MatchingInfo, 'prompts'> {
  prompts: MatchingPromptWithAnswer[];
  rubric?: Rubric;
}

export interface MultipleChoiceInfoWithAnswer extends MultipleChoiceInfo {
  answer?: MultipleChoiceState;
  rubric?: Rubric;
}

export interface TextInfoWithAnswer extends TextInfo {
  answer: TextState;
  rubric?: Rubric;
}

export type BodyItemWithAnswer =
  HTMLValWithAnswer | AllThatApplyInfoWithAnswer | CodeInfoWithAnswer | YesNoInfoWithAnswer |
  CodeTagInfoWithAnswer | MultipleChoiceInfoWithAnswer |
  TextInfoWithAnswer | MatchingInfoWithAnswer;

export interface PartInfoWithAnswers extends Omit<PartInfo, 'body'> {
  body: BodyItemWithAnswer[];
  partRubric?: Rubric;
}

export interface QuestionInfoWithAnswers extends Omit<QuestionInfo, 'parts'> {
  parts: PartInfoWithAnswers[];
  questionRubric?: Rubric;
}

export interface ExamVersionWithAnswers extends Omit<ExamVersion, 'questions'> {
  questions: QuestionInfoWithAnswers[];
  examRubric?: Rubric;
}

type GradingComment = string;

export type Preset = {
  railsId?: number;
  id?: string;
  label?: string;
  graderHint: GradingComment;
  studentFeedback?: GradingComment;
  points: number;
  inUse?: boolean;
}

export type RubricPresets = {
  railsId?: number;
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

function isHTMLVal(obj : unknown): obj is HTMLVal {
  return obj !== undefined && obj !== null
    && (obj as HTMLVal).type === 'HTML'
    && (typeof (obj as HTMLVal).value === 'string');
}

function isPreset(obj : unknown): obj is Preset {
  if (obj === undefined || obj === null) return false;
  const objAsPreset = (obj as Preset);
  return (typeof objAsPreset.graderHint === 'string')
    && (objAsPreset.studentFeedback === undefined || typeof objAsPreset.studentFeedback === 'string')
    && (typeof objAsPreset.points === 'number');
}

export function isRubricPresets(obj : unknown): obj is RubricPresets {
  if (obj === null || obj === undefined) return false;
  const objAsRubricPresets = (obj as RubricPresets);
  return (objAsRubricPresets.label === undefined || typeof objAsRubricPresets.label === 'string')
    && (objAsRubricPresets.direction === 'credit' || objAsRubricPresets.direction === 'deduction')
    && (objAsRubricPresets.mercy === undefined || typeof objAsRubricPresets.mercy === 'number')
    && array(isPreset)(objAsRubricPresets.presets);
}

function isEditablePreset(obj : unknown): obj is EditablePreset {
  if (obj === undefined || obj === null) return false;
  const objAsPreset = (obj as Preset);
  return (typeof objAsPreset.graderHint === 'string')
    && (objAsPreset.studentFeedback === undefined || typeof objAsPreset.studentFeedback === 'string')
    && (typeof objAsPreset.points === 'number' || typeof objAsPreset.points === 'string');
}

export function isEditableRubricPresets(obj : unknown): obj is EditableRubricPresets {
  if (obj === null || obj === undefined) return false;
  const objAsRubricPresets = (obj as RubricPresets);
  return (objAsRubricPresets.label === undefined || typeof objAsRubricPresets.label === 'string')
    && (objAsRubricPresets.direction === 'credit' || objAsRubricPresets.direction === 'deduction')
    && (objAsRubricPresets.mercy === undefined || typeof objAsRubricPresets.mercy === 'number')
    && array(isEditablePreset)(objAsRubricPresets.presets);
}

export type Rubric = RubricAll | RubricAny | RubricOne | RubricNone;

export function isRubric(obj : unknown): obj is Rubric {
  // mutual recursion trips up this rule
  // eslint-disable-next-line no-use-before-define
  return isRubricAll(obj) || isRubricAny(obj) || isRubricOne(obj) || isRubricNone(obj);
}

export type RubricNone = {
  type: 'none';
  railsId?: number;
  inUse?: boolean;
}
export function isRubricNone(obj : unknown): obj is RubricNone {
  return (obj !== undefined && obj !== null)
    && (obj as RubricNone).type === 'none';
}

export type RubricAll = {
  type: 'all';
  railsId?: number;
  description?: HTMLVal;
  choices: Rubric[] | RubricPresets;
  inUse?: boolean;
}
export function isRubricAll(obj : unknown): obj is RubricAll {
  if (obj === undefined || obj === null) return false;
  const objAsRubricAll = obj as RubricAll;
  return objAsRubricAll.type === 'all'
    && maybe(isHTMLVal)(objAsRubricAll.description)
    && (array(isRubric)(objAsRubricAll.choices) || isRubricPresets(objAsRubricAll.choices));
}

export type RubricAny = {
  type: 'any';
  railsId?: number;
  points: number;
  description?: HTMLVal;
  choices: Rubric[] | RubricPresets;
  inUse?: boolean;
}
export function isRubricAny(obj : unknown): obj is RubricAny {
  if (obj === undefined || obj === null) return false;
  const objAsRubricAny = obj as RubricAny;
  const ans = objAsRubricAny.type === 'any'
    && (typeof objAsRubricAny.points === 'number')
    && maybe(isHTMLVal)(objAsRubricAny.description)
    && (array(isRubric)(objAsRubricAny.choices) || isRubricPresets(objAsRubricAny.choices));
  return ans;
}

export type RubricOne = {
  type: 'one';
  railsId?: number;
  points: number;
  description?: HTMLVal;
  choices: Rubric[] | RubricPresets;
  inUse?: boolean;
}
export function isRubricOne(obj : unknown): obj is RubricOne {
  if (obj === undefined || obj === null) return false;
  const objAsRubricOne = obj as RubricOne;
  const ans = objAsRubricOne.type === 'one'
    && (typeof objAsRubricOne.points === 'number')
    && maybe(isHTMLVal)(objAsRubricOne.description)
    && (array(isRubric)(objAsRubricOne.choices) || isRubricPresets(objAsRubricOne.choices));
  return ans;
}

export type PartRubric = {
  partRubric?: Rubric;
  body: Rubric[];
}

export function isPartRubric(obj : unknown): obj is PartRubric {
  const ans = obj !== null && obj !== undefined
    && maybe(isRubric)((obj as PartRubric).partRubric)
    && array(isRubric)((obj as PartRubric).body);
  return ans;
}

export type QuestionRubric = {
  questionRubric?: Rubric;
  parts: PartRubric[];
}

export function isQuestionRubric(obj : unknown): obj is QuestionRubric {
  const ans = obj !== null && obj !== undefined
    && maybe(isRubric)((obj as QuestionRubric).questionRubric)
    && array(isPartRubric)((obj as QuestionRubric).parts);
  return ans;
}

export type ExamRubric = {
  examRubric?: Rubric;
  questions: QuestionRubric[];
}

export function isExamRubric(obj : unknown): obj is ExamRubric {
  const ans = obj !== null && obj !== undefined
    && maybe(isRubric)((obj as ExamRubric).examRubric)
    && array(isQuestionRubric)((obj as ExamRubric).questions);
  return ans;
}
