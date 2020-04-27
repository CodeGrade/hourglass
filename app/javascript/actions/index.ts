import { ExamState, StatePath, AnswerState } from '../types';
import { Action as RAction } from 'redux';

export type Action = UpdateAnswerAction;

export interface UpdateAnswerAction {
  type: 'UPDATE_ANSWER',
  path: StatePath;
  val: AnswerState,
}

export function updateAnswer(path: StatePath, val: AnswerState): UpdateAnswerAction {
  return {
    type: 'UPDATE_ANSWER',
    path,
    val,
  };
}
