import {
  Exam,
  AnswersState,
  Policy,
  RailsExam,
} from '@student/exams/show/types';
import {
  LoadExamAction,
  UpdateInstructionsAction,
  UpdatePoliciesAction,
  UpdateTitleAction,
  UpdateQuestionAction,
  MoveQuestionAction,
  MovePartAction,
  MoveBodyItemAction,
  UpdatePartAction,
} from '@professor/exams/new/types';


export function loadExam(
  railsExam: RailsExam,
  exam: Exam,
  answers: AnswersState,
): LoadExamAction {
  return {
    type: 'LOAD_EXAM',
    exam,
    answers,
    railsExam,
  };
}

export function updateTitle(
  title: string,
): UpdateTitleAction {
  return {
    type: 'UPDATE_TITLE',
    title,
  };
}
export function updateInstructions(
  val: string,
): UpdateInstructionsAction {
  return {
    type: 'UPDATE_INSTRUCTIONS',
    val,
  };
}

export function updateQuestion(
  qnum: number,
  name: string,
  description: string,
  separateSubparts: boolean,
): UpdateQuestionAction {
  return {
    type: 'UPDATE_QUESTION',
    qnum,
    name,
    description,
    separateSubparts,
  };
}

export function moveQuestion(
  from: number,
  to: number,
): MoveQuestionAction {
  return {
    type: 'MOVE_QUESTION',
    from,
    to,
  };
}

export function updatePart(
  qnum: number,
  pnum: number,
  name: string,
  description: string,
  points: number,
): UpdatePartAction {
  return {
    type: 'UPDATE_PART',
    qnum,
    pnum,
    name,
    description,
    points,
  };
}


export function movePart(
  qnum: number,
  from: number,
  to: number,
): MovePartAction {
  return {
    type: 'MOVE_PART',
    qnum,
    from,
    to,
  };
}

export function moveBodyItem(
  qnum: number,
  pnum: number,
  from: number,
  to: number,
): MoveBodyItemAction {
  return {
    type: 'MOVE_BODY_ITEM',
    qnum,
    pnum,
    from,
    to,
  };
}

export function updatePolicies(
  policies: Policy[],
): UpdatePoliciesAction {
  return {
    type: 'UPDATE_POLICIES',
    policies,
  };
}
