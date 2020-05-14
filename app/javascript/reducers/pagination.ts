import {
  PaginationState, ExamTakerAction, PaginationCoordinates,
} from '@hourglass/types';

const sameCoords = (a: PaginationCoordinates) => (b: PaginationCoordinates): boolean => (
  a.question === b.question && a.part === b.part
);

const wrap = (max: number, wrappee: number): number => (wrappee + max) % max;

export default (state: PaginationState = {
  paginated: false,
  coords: [],
  selected: 0,
  spy: 0,
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
        selected: state.coords.findIndex(sameCoords(action.coords)),
      };
    case 'SPY_QUESTION':
      return {
        ...state,
        spy: state.coords.findIndex(sameCoords(action.coords)),
      };
    case 'PREV_QUESTION':
      return {
        ...state,
        selected: wrap(state.coords.length, state.selected - 1),
      };
    case 'NEXT_QUESTION':
      return {
        ...state,
        selected: wrap(state.coords.length, state.selected + 1),
      };
    case 'LOAD_EXAM': {
      const coords = action.exam.questions.reduce((acc, q, qnum) => {
        const thisQ = {
          question: qnum,
        };
        const parts = q.parts.reduce((pacc, _p, pnum) => {
          const thisP = {
            question: qnum,
            part: pnum,
          };
          return [...pacc, thisP];
        }, []);
        return [...acc, thisQ, ...parts];
      }, []);
      return {
        ...state,
        coords,
      };
    }
    default:
      return state;
  }
};
