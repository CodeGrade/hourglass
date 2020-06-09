import { ExamEditorAction } from '@professor/exams/new/types';
import { RailsExamVersion } from '@student/exams/show/types';

export default (state: RailsExamVersion = {
  id: undefined,
  name: '',
  policies: [],
}, action: ExamEditorAction): RailsExamVersion => {
  switch (action.type) {
    case 'UPDATE_POLICIES': {
      return {
        ...state,
        policies: action.policies,
      };
    }
    case 'UPDATE_TITLE': {
      return {
        ...state,
        name: action.title,
      };
    }
    default:
      return state;
  }
};
