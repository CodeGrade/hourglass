import {
  PaginationState, ExamTakerAction, PaginationCoordinates,
} from '@hourglass/types';

const sameCoords = (a: PaginationCoordinates) => (b: PaginationCoordinates): boolean => (
  a.question === b.question && a.part === b.part
);

export default (state: PaginationState = {
  paginated: false,
  spyCoords: [],
  pageCoords: [],
  page: 0,
  spy: 0,
  waypointsActive: true,
}, action: ExamTakerAction): PaginationState => {
  switch (action.type) {
    case 'TOGGLE_PAGINATION': {
      let idx = state.pageCoords.findIndex(sameCoords(state.spyCoords[state.spy]));
      if (idx === -1) {
        idx = state.pageCoords.findIndex((c) => c.question === state.spyCoords[state.spy].question);
      }
      return {
        ...state,
        paginated: !state.paginated,
        page: idx,
      };
    }
    case 'VIEW_QUESTION': {
      // If paginated, find the most specific page and switch to it.
      let { page } = state;
      if (state.paginated) {
        let idx = state.pageCoords.findIndex(sameCoords(action.coords));
        if (idx === -1) {
          idx = state.pageCoords.findIndex((c) => c.question === action.coords.question);
        }
        page = idx;
      }
      return {
        ...state,
        page,
      };
    }
    case 'SPY_QUESTION':
      return {
        ...state,
        spy: state.spyCoords.findIndex(sameCoords(action.coords)),
      };
    case 'PREV_QUESTION': {
      const page = state.page - 1;
      return {
        ...state,
        page,
        spy: state.spyCoords.findIndex(sameCoords(state.pageCoords[page])),
      };
    }
    case 'NEXT_QUESTION': {
      const page = state.page + 1;
      return {
        ...state,
        page,
        spy: state.spyCoords.findIndex(sameCoords(state.pageCoords[page])),
      };
    }
    case 'ACTIVATE_WAYPOINTS':
      return {
        ...state,
        waypointsActive: action.enabled,
      };
    case 'LOAD_EXAM': {
      const pageCoords = [];
      const spyCoords = [];
      action.exam.questions.forEach((q, qnum) => {
        const thisQ = {
          question: qnum,
        };
        spyCoords.push(thisQ);
        if (!q.separateSubparts) pageCoords.push(thisQ);
        q.parts.forEach((_p, pnum) => {
          const thisP = {
            question: qnum,
            part: pnum,
          };
          spyCoords.push(thisP);
          if (q.separateSubparts) pageCoords.push(thisP);
        });
      });
      return {
        ...state,
        spyCoords,
        pageCoords,
      };
    }
    default:
      return state;
  }
};
