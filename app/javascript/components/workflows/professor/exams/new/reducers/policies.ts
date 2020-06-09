import { ExamEditorAction } from '@professor/exams/new/types';
import { Policy } from '@hourglass/workflows/student/exams/show/types';

export default (
  state: Policy[] = [],
  action: ExamEditorAction,
): Policy[] => {
  switch (action.type) {
    case 'UPDATE_POLICIES':
      return action.policies;
    default:
      return state;
  }
};
