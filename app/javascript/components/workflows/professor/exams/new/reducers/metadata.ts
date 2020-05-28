import { ExamEditorAction } from '@professor/exams/new/types';
import { RailsExam } from '@student/exams/show/types';

export default (state: RailsExam = {
  id: undefined,
  name: '',
  policies: [],
}, action: ExamEditorAction): RailsExam => {
  switch (action.type) {
    case 'LOAD_EXAM': {
      return {
        ...state,
        name: action.railsExam.name,
        policies: action.railsExam.policies,
      };
    }
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
