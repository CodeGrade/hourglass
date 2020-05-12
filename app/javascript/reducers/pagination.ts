import {
  PaginationState, ExamTakerAction,
} from '@hourglass/types';

export default (state: PaginationState = {
  paginated: false,
  selected: {
    question: 0,
    part: undefined,
  },
  spy: {
    question: 0,
    part: undefined,
  },
}, action: ExamTakerAction): PaginationState => {
  switch (action.type) {
    case 'TOGGLE_PAGINATION':
      return {
        ...state,
        paginated: !state.paginated,
      };
    case 'VIEW_QUESTION':
      return {
        ...state,
        selected: {
          question: action.question,
          part: action.part,
        },
      };
    case 'SPY_QUESTION':
      return {
        ...state,
        spy: {
          question: action.question,
          part: action.part,
        },
      };
    default:
      return state;
  }
};
