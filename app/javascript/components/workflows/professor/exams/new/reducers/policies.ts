import { ExamEditorAction, ExamEditorState } from '@professor/exams/new/types';

export default (
  state: ExamEditorState['policies'] = [],
  action: ExamEditorAction,
): ExamEditorState['policies'] => {
  switch (action.type) {
    case 'UPDATE_POLICIES':
      return action.policies;
    default:
      return state;
  }
};
