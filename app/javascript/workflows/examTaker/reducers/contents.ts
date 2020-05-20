import {
  ContentsState,
  ExamTakerAction,
} from '@examTaker/types';

export default (state: ContentsState = {
  exam: undefined,
  answers: undefined,
}, action: ExamTakerAction): ContentsState => {
  switch (action.type) {
    case 'LOAD_EXAM':
      return {
        ...state,
        exam: action.exam,
        answers: action.answers,
      };
    case 'UPDATE_ANSWER': {
      const ret = { ...state.answers };
      const { qnum, pnum, bnum } = action;
      ret[qnum] = { ...state.answers[qnum] };
      ret[qnum][pnum] = { ...state.answers[qnum]?.[pnum] };
      ret[qnum][pnum][bnum] = action.val;
      return {
        ...state,
        answers: ret,
      };
    }
    case 'UPDATE_SCRATCH':
      return {
        ...state,
        answers: {
          ...state.answers,
          scratch: action.val,
        },
      };
    default:
      return state;
  }
};
