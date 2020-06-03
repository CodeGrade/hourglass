import {
  ContentsState,
  ExamTakerAction,
} from '@student/exams/show/types';

export default (state: ContentsState = {
  exam: undefined,
  answers: {
    answers: [],
    scratch: '',
  },
}, action: ExamTakerAction): ContentsState => {
  switch (action.type) {
    case 'LOAD_EXAM': {
      return {
        exam: action.exam,
        answers: action.answers,
        time: action.time,
      };
    }
    case 'UPDATE_ANSWER': {
      const { qnum, pnum, bnum } = action;
      const answers = [...state.answers.answers];
      answers[qnum] = [...answers[qnum]];
      answers[qnum][pnum] = [...answers[qnum][pnum]];
      answers[qnum][pnum][bnum] = action.val;
      return {
        ...state,
        answers: {
          ...state.answers,
          answers,
        },
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
