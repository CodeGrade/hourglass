import { ContentsState } from '@student/exams/show/types';
import { ExamEditorAction } from '@professor/exams/new/types';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';

export default (state: ContentsState = {
  exam: {
    questions: [],
    instructions: {
      type: 'HTML',
      value: '',
    },
    files: [],
  },
  answers: {
    answers: [],
    scratch: '',
  },
}, action: ExamEditorAction): ContentsState => {
  switch (action.type) {
    case 'LOAD_EXAM':
      return {
        exam: action.exam,
        answers: action.answers,
      };
    case 'UPDATE_INSTRUCTIONS': {
      const { exam } = state;
      return {
        ...state,
        exam: {
          ...exam,
          instructions: action.val,
        },
      };
    }
    case 'UPDATE_EXAM_FILE_REFS': {
      return {
        ...state,
        exam: {
          ...state.exam,
          reference: action.reference,
        },
      };
    }
    case 'UPDATE_EXAM_FILES': {
      const { questions } = state.exam;
      return {
        ...state,
        exam: {
          ...state.exam,
          files: action.files,
          reference: [],
          questions: state.exam.questions.map((q) => ({
            ...q,
            reference: [],
            parts: q.parts.map((p) => ({
              ...p,
              reference: [],
            })),
          })),
        },
        answers: {
          scratch: state.answers.scratch,
          answers: state.answers.answers.map(
            (qans, qnum) => qans.map(
              (pans, pnum) => pans.map(
                (bans, bnum) => {
                  switch (questions[qnum].parts[pnum].body[bnum].type) {
                    case 'CodeTag': return { NO_ANS: true };
                    default: return bans;
                  }
                },
              ),
            ),
          ),
        },
      };
    }
    case 'ADD_QUESTION': {
      const questions = [...state.exam.questions];
      const { qnum, question } = action;
      questions.splice(qnum, 0, question);
      const answers = [...state.answers.answers];
      answers.splice(qnum, 0, undefined);
      return {
        ...state,
        exam: {
          ...state.exam,
          questions,
        },
        answers: {
          ...state.answers,
          answers,
        },
      };
    }
    case 'DELETE_QUESTION': {
      const questions = [...state.exam.questions];
      const answers = [...state.answers.answers];
      const { qnum } = action;
      questions.splice(qnum, 1);
      answers.splice(qnum, 1);
      return {
        ...state,
        exam: {
          ...state.exam,
          questions,
        },
        answers: {
          ...state.answers,
          answers,
        },
      };
    }
    case 'UPDATE_QUESTION': {
      const questions = [...state.exam.questions];
      const {
        qnum,
        name,
        description,
        separateSubparts,
      } = action;
      questions[qnum] = {
        ...questions[qnum],
        name,
        description,
        separateSubparts,
      };
      return {
        ...state,
        exam: {
          ...state.exam,
          questions,
        },
      };
    }
    case 'UPDATE_QUESTION_FILE_REFS': {
      const questions = [...state.exam.questions];
      const { qnum, reference } = action;
      questions[qnum] = {
        ...questions[qnum],
        reference,
      };
      return {
        ...state,
        exam: {
          ...state.exam,
          questions,
        },
      };
    }
    case 'MOVE_QUESTION': {
      const questions = [...state.exam.questions];
      const { from, to } = action;
      const q = questions[from];
      questions.splice(from, 1);
      questions.splice(to, 0, q);
      const answers = [...state.answers.answers];
      const a = answers[from];
      answers.splice(from, 1);
      answers.splice(to, 0, a);
      return {
        ...state,
        exam: {
          ...state.exam,
          questions,
        },
        answers: {
          ...state.answers,
          answers,
        },
      };
    }
    case 'ADD_PART': {
      const { qnum, pnum, part } = action;
      const questions = [...state.exam.questions];
      questions[qnum] = { ...questions[qnum] };
      questions[qnum].parts = [...questions[qnum].parts];
      questions[qnum].parts.splice(pnum, 0, part);
      const answers = [...state.answers.answers];
      const ansQnum = [...answers[qnum] || []];
      ansQnum.splice(pnum, 0, []);
      answers[qnum] = ansQnum;
      return {
        ...state,
        exam: {
          ...state.exam,
          questions,
        },
        answers: {
          ...state.answers,
          answers,
        },
      };
    }
    case 'DELETE_PART': {
      const ret = { ...state.exam };
      const { qnum, pnum } = action;
      ret.questions[qnum].parts.splice(pnum, 1);
      return {
        ...state,
        exam: ret,
      };
    }
    case 'UPDATE_PART': {
      const {
        qnum,
        pnum,
        name,
        description,
        points,
      } = action;
      const questions = [...state.exam.questions];
      questions[qnum] = { ...questions[qnum] };
      questions[qnum].parts = [...questions[qnum].parts];
      questions[qnum].parts[pnum] = {
        ...questions[qnum].parts[pnum],
        name,
        description,
        points,
      };
      return {
        ...state,
        exam: {
          ...state.exam,
          questions,
        },
      };
    }
    case 'UPDATE_PART_FILE_REFS': {
      const questions = [...state.exam.questions];
      const { qnum, pnum, reference } = action;
      questions[qnum] = { ...questions[qnum] };
      questions[qnum].parts = [...questions[qnum].parts];
      questions[qnum].parts[pnum] = {
        ...questions[qnum].parts[pnum],
        reference,
      };
      return {
        ...state,
        exam: {
          ...state.exam,
          questions,
        },
      };
    }
    case 'MOVE_PART': {
      const { qnum, from, to } = action;
      const questions = [...state.exam.questions];
      questions[qnum] = { ...questions[qnum] };
      questions[qnum].parts = [...questions[qnum].parts];
      const p = questions[qnum].parts[from];
      questions[qnum].parts.splice(from, 1);
      questions[qnum].parts.splice(to, 0, p);
      const answers = [...state.answers.answers];
      const ansQnum = [...answers[qnum]];
      const a = answers[qnum][from];
      ansQnum.splice(from, 1);
      ansQnum.splice(to, 0, a);
      answers[qnum] = ansQnum;
      return {
        ...state,
        exam: {
          ...state.exam,
          questions,
        },
        answers: {
          ...state.answers,
          answers,
        },
      };
    }
    case 'ADD_BODY_ITEM': {
      const ret = { ...state.exam };
      const {
        qnum,
        pnum,
        bnum,
        body,
      } = action;
      ret.questions = [...ret.questions];
      ret.questions[qnum] = { ...ret.questions[qnum] };
      ret.questions[qnum].parts = [...ret.questions[qnum].parts];
      ret.questions[qnum].parts[pnum] = { ...ret.questions[qnum].parts[pnum] };
      ret.questions[qnum].parts[pnum].body = [...ret.questions[qnum].parts[pnum].body];
      ret.questions[qnum].parts[pnum].body.splice(bnum, 0, body);
      return {
        ...state,
        exam: ret,
      };
    }
    case 'DELETE_BODY_ITEM': {
      const ret = { ...state.exam };
      const { qnum, pnum, bnum } = action;
      ret.questions = [...ret.questions];
      ret.questions[qnum] = { ...ret.questions[qnum] };
      ret.questions[qnum].parts = [...ret.questions[qnum].parts];
      ret.questions[qnum].parts[pnum] = { ...ret.questions[qnum].parts[pnum] };
      ret.questions[qnum].parts[pnum].body = [...ret.questions[qnum].parts[pnum].body];
      ret.questions[qnum].parts[pnum].body.splice(bnum, 1);
      return {
        ...state,
        exam: ret,
      };
    }
    case 'UPDATE_HTML_BODY_ITEM': {
      const {
        qnum,
        pnum,
        bnum,
        value,
      } = action;
      const ret = { ...state.exam };
      ret.questions = [...ret.questions];
      ret.questions[qnum] = { ...ret.questions[qnum] };
      ret.questions[qnum].parts = [...ret.questions[qnum].parts];
      ret.questions[qnum].parts[pnum] = { ...ret.questions[qnum].parts[pnum] };
      ret.questions[qnum].parts[pnum].body = [...ret.questions[qnum].parts[pnum].body];
      ret.questions[qnum].parts[pnum].body[bnum] = value;
      return {
        ...state,
        exam: ret,
      };
    }
    case 'UPDATE_BODY_ITEM': {
      const {
        qnum,
        pnum,
        bnum,
        info,
        answer,
      } = action;
      const questions = [...state.exam.questions];
      questions[qnum] = { ...questions[qnum] };
      questions[qnum].parts = [...questions[qnum].parts];
      questions[qnum].parts[pnum] = { ...questions[qnum].parts[pnum] };
      questions[qnum].parts[pnum].body = [...questions[qnum].parts[pnum].body];
      let bodyItem = questions[qnum].parts[pnum].body[bnum];
      const answers = [...state.answers.answers];
      const ansQnum = [...answers[qnum]];
      const ansPnum = [...ansQnum[pnum]];
      switch (bodyItem.type) {
        case 'HTML':
        case 'Code':
        case 'AllThatApply':
        case 'CodeTag':
        case 'Matching':
        case 'MultipleChoice':
        case 'Text':
        case 'YesNo':
          bodyItem = {
            ...bodyItem,
            ...info,
          };
          break;
        default:
          throw new ExhaustiveSwitchError(bodyItem);
      }
      questions[qnum].parts[pnum].body[bnum] = bodyItem;
      ansPnum[bnum] = answer;
      ansQnum[pnum] = ansPnum;
      answers[qnum] = ansQnum;
      return {
        exam: {
          ...state.exam,
          questions,
        },
        answers: {
          ...state.answers,
          answers,
        },
      };
    }
    case 'MOVE_BODY_ITEM': {
      const {
        qnum,
        pnum,
        from,
        to,
      } = action;
      const questions = [...state.exam.questions];
      questions[qnum] = { ...questions[qnum] };
      questions[qnum].parts = [...questions[qnum].parts];
      questions[qnum].parts[pnum] = { ...questions[qnum].parts[pnum] };
      questions[qnum].parts[pnum].body = [...questions[qnum].parts[pnum].body];
      const b = questions[qnum].parts[pnum].body[from];
      questions[qnum].parts[pnum].body.splice(from, 1);
      questions[qnum].parts[pnum].body.splice(to, 0, b);
      const answers = [...state.answers.answers];
      const ansQnum = [...answers[qnum]];
      const ansPnum = [...ansQnum[pnum]];
      const a = answers[qnum][pnum][from];
      ansPnum.splice(from, 1);
      ansPnum.splice(to, 0, a);
      ansQnum[pnum] = ansPnum;
      answers[qnum] = ansQnum;
      return {
        ...state,
        exam: {
          ...state.exam,
          questions,
        },
        answers: {
          ...state.answers,
          answers,
        },
      };
    }
    default:
      return state;
  }
};
