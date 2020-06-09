import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { MapStateToProps } from 'react-redux';
import {
  QuestionInfo,
  PartInfo,
  BodyItem,
  ContentsState,
  Policy,
  RailsExamVersion,
  HTMLVal,
  AnswerState,
  ExamFile,
  FileRef,
} from '@student/exams/show/types';

export type Thunk = ThunkAction<void, ContentsState, unknown, ExamEditorAction>;
export type ExamEditorDispatch = ThunkDispatch<ContentsState, unknown, ExamEditorAction>;

export type MSTP<TStateProps, TOwnProps = Record<string, unknown>> =
  MapStateToProps<TStateProps, TOwnProps, ExamEditorState>;

export type MDTP<TDispatchProps, TOwnProps = Record<string, unknown>> =
  (dispatch: ExamEditorDispatch, ownProps: TOwnProps) => TDispatchProps;


export interface ExamEditorState {
  contents: ContentsState;
  railsExam: RailsExamVersion;
}

export type ExamEditorAction = UpdateInstructionsAction | UpdatePoliciesAction | UpdateTitleAction
| UpdateExamFilesAction | UpdateExamFileRefsAction
| AddQuestionAction | DeleteQuestionAction | MoveQuestionAction
| UpdateQuestionAction | UpdateQuestionFileRefsAction
| AddPartAction | DeletePartAction | MovePartAction
| UpdatePartAction | UpdatePartFileRefsAction
| AddBodyItemAction | DeleteBodyItemAction | UpdateBodyItemAction | MoveBodyItemAction
| UpdateHTMLBodyItemAction;

export interface UpdateTitleAction {
  type: 'UPDATE_TITLE';
  title: string;
}

export interface UpdateInstructionsAction {
  type: 'UPDATE_INSTRUCTIONS';
  val: HTMLVal;
}

export interface UpdateExamFilesAction {
  type: 'UPDATE_EXAM_FILES';
  files: ExamFile[];
}

export interface UpdateExamFileRefsAction {
  type: 'UPDATE_EXAM_FILE_REFS';
  reference: FileRef[];
}

export interface UpdateQuestionFileRefsAction {
  type: 'UPDATE_QUESTION_FILE_REFS';
  qnum: number;
  reference: FileRef[];
}

export interface UpdatePartFileRefsAction {
  type: 'UPDATE_PART_FILE_REFS';
  qnum: number;
  pnum: number;
  reference: FileRef[];
}

export interface UpdatePoliciesAction {
  type: 'UPDATE_POLICIES';
  policies: Policy[];
}

export interface AddQuestionAction {
  type: 'ADD_QUESTION';
  qnum: number;
  question: QuestionInfo;
}

export interface DeleteQuestionAction {
  type: 'DELETE_QUESTION';
  qnum: number;
}

export interface UpdateQuestionAction {
  type: 'UPDATE_QUESTION';
  qnum: number;
  name: HTMLVal;
  description: HTMLVal;
  separateSubparts: boolean;
}

export interface MoveQuestionAction {
  type: 'MOVE_QUESTION';
  from: number;
  to: number;
}

export interface AddPartAction {
  type: 'ADD_PART';
  qnum: number;
  pnum: number;
  part: PartInfo;
}

export interface DeletePartAction {
  type: 'DELETE_PART';
  qnum: number;
  pnum: number;
}

export interface UpdatePartAction {
  type: 'UPDATE_PART';
  qnum: number;
  pnum: number;
  name: HTMLVal;
  description: HTMLVal;
  points: number;
}

export interface MovePartAction {
  type: 'MOVE_PART';
  qnum: number;
  from: number;
  to: number;
}

export interface AddBodyItemAction {
  type: 'ADD_BODY_ITEM';
  qnum: number;
  pnum: number;
  bnum: number;
  body: BodyItem;
}

export interface DeleteBodyItemAction {
  type: 'DELETE_BODY_ITEM';
  qnum: number;
  pnum: number;
  bnum: number;
}

export interface UpdateBodyItemAction {
  type: 'UPDATE_BODY_ITEM';
  qnum: number;
  pnum: number;
  bnum: number;
  info: BodyItem;
  answer: AnswerState;
}

export interface UpdateHTMLBodyItemAction {
  type: 'UPDATE_HTML_BODY_ITEM';
  qnum: number;
  pnum: number;
  bnum: number;
  value: HTMLVal;
}


export interface MoveBodyItemAction {
  type: 'MOVE_BODY_ITEM';
  qnum: number;
  pnum: number;
  from: number;
  to: number;
}
