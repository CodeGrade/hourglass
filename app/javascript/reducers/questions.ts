import {
  ProfQuestionState,
  ExamTakerAction,
} from '@hourglass/types';
import { DateTime } from 'luxon';

export default (state: ProfQuestionState = {
  lastId: 0,
  questions: [],
}, action: ExamTakerAction): ProfQuestionState => {
  switch (action.type) {
    case 'LOAD_EXAM': {
      const lastId = action.questions[0]?.id ?? 0;
      return {
        ...state,
        lastId,
        questions: action.questions,
      };
    }
    case 'QUESTION_ASKED':
      return {
        ...state,
        lastId: state.lastId + 1,
        questions: [
          {
            id: action.id,
            body: action.body,
            time: DateTime.local(),
            status: 'SENDING',
          },
          ...state.questions,
        ],
      };
    case 'QUESTION_FAILED': {
      const idx = state.questions.findIndex((q) => q.id === action.id);
      const update = {};
      update[idx] = {
        ...state.questions[idx],
        status: 'FAILED',
      };
      return {
        ...state,
        questions: Object.assign(
          [],
          state.questions,
          update,
        ),
      };
    }
    case 'QUESTION_SUCCEEDED': {
      const idx = state.questions.findIndex((q) => q.id === action.id);
      const update = {};
      update[idx] = {
        ...state.questions[idx],
        status: 'SENT',
      };
      return {
        ...state,
        questions: Object.assign(
          [],
          state.questions,
          update,
        ),
      };
    }
    default:
      return state;
  }
};
