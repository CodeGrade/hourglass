import {
  Exam,
  AnswersState,
  Policy,
  RailsExam,
  HTMLVal,
  ExamFile,
  QuestionInfo,
  PartInfo,
  BodyItem,
} from '@student/exams/show/types';
import {
  LoadExamAction,
  UpdateExamFilesAction,
  UpdateInstructionsAction,
  UpdatePoliciesAction,
  UpdateTitleAction,
  AddQuestionAction,
  UpdateQuestionAction,
  MoveQuestionAction,
  DeleteQuestionAction,
  AddPartAction,
  MovePartAction,
  UpdatePartAction,
  DeletePartAction,
  AddBodyItemAction,
  MoveBodyItemAction,
  UpdateHTMLBodyItemAction,
  DeleteBodyItemAction,
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

export function updateExamFiles(
  files: ExamFile[],
): UpdateExamFilesAction {
  return {
    type: 'UPDATE_EXAM_FILES',
    files,
  };
}

export function addQuestion(
  qnum: number,
  question: QuestionInfo,
): AddQuestionAction {
  return {
    type: 'ADD_QUESTION',
    qnum,
    question,
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

export function deleteQuestion(
  qnum: number,
): DeleteQuestionAction {
  return {
    type: 'DELETE_QUESTION',
    qnum,
  };
}

export function addPart(
  qnum: number,
  pnum: number,
  part: PartInfo,
): AddPartAction {
  return {
    type: 'ADD_PART',
    qnum,
    pnum,
    part,
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

export function deletePart(
  qnum: number,
  pnum: number,
): DeletePartAction {
  return {
    type: 'DELETE_PART',
    qnum,
    pnum,
  };
}

export function addBodyItem(
  qnum: number,
  pnum: number,
  bnum: number,
  body: BodyItem,
): AddBodyItemAction {
  return {
    type: 'ADD_BODY_ITEM',
    qnum,
    pnum,
    bnum,
    body,
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

export function deleteBodyItem(
  qnum: number,
  pnum: number,
  bnum: number,
): DeleteBodyItemAction {
  return {
    type: 'DELETE_BODY_ITEM',
    qnum,
    pnum,
    bnum,
  };
}

export function editHtmlBodyItem(
  qnum: number,
  pnum: number,
  bnum: number,
  value: HTMLVal,
): UpdateHTMLBodyItemAction {
  return {
    type: 'UPDATE_HTML_BODY_ITEM',
    qnum,
    pnum,
    bnum,
    value,
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
