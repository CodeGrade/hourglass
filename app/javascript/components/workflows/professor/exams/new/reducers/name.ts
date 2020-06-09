import { ExamEditorAction } from '@professor/exams/new/types';

export default (
  state = '',
  action: ExamEditorAction,
): string => {
  switch (action.type) {
    case 'UPDATE_TITLE':
      return action.title;
    default:
      return state;
  }
};
