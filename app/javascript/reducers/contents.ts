import {
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
    case 'UPDATE_ANSWER': {
      const ret = { ...state.data.answers };
      const [qnum, pnum, bnum] = action.path;
      ret[qnum] = { ...state.data.answers[qnum] };
      ret[qnum][pnum] = { ...state.data.answers[qnum][pnum] };
      ret[qnum][pnum][bnum] = action.val;
      return {
        ...state,
        data: {
          ...state.data,
          answers: ret,
        },
      };
    }
    case 'UPDATE_SCRATCH':
      return {
        ...state,
        data: {
          ...state.data,
          answers: {
            ...state.data.answers,
            scratch: action.val,
          },
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
