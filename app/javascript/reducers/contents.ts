import {
  AnswersState,
  ContentsState,
  ExamTakerAction,
} from '@hourglass/types';


export default (state: ContentsState = {
  data: undefined,
  loaded: false,
  pagination: {
    paginated: false,
    selected: {
      question: 0,
      part: 0,
    },
  },
}, action: ExamTakerAction): ContentsState => {
  switch (action.type) {
    case 'LOAD_EXAM':
      return {
        ...state,
        data: action.contents,
      };
    case 'UPDATE_ANSWER':
      const ret = {
        ...state.data.answers,
      };
      let cur = ret;
      for (let i = 0; i < action.path.length - 1; i++) {
        cur[action.path[i]] = { ...cur[action.path[i]] };
        cur = cur[action.path[i]];
      }
      cur[action.path[action.path.length - 1]] = action.val;
      return {
        ...state,
        data: {
          ...state.data,
          answers: ret,
        },
      };
    case 'TOGGLE_PAGINATION':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          paginated: !state.pagination.paginated,
        },
      };
    case 'VIEW_QUESTION':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          selected: {
            question: action.question,
            part: action.part,
          },
        },
      };
    default:
      return state;
  }
};
