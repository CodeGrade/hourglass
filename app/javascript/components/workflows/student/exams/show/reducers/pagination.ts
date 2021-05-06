import {
  PaginationState, ExamTakerAction, PaginationCoordinates,
} from '@student/exams/show/types';

const sameCoords = (a: PaginationCoordinates) => (b: PaginationCoordinates): boolean => (
  a.question === b.question && a.part === b.part
);

const findBestPageCoordIdx = (
  pageCoords: PaginationCoordinates[],
  coord: PaginationCoordinates,
): number => {
  let idx = pageCoords.findIndex(sameCoords(coord));
  if (idx === -1) {
    idx = pageCoords.findIndex((c) => c.question === coord.question);
  }
  return idx;
};

export default (state: PaginationState = {
  paginated: false,
  spyCoords: [],
  pageCoords: [],
  page: 0,
  spy: 0,
  waypointsActive: true,
}, action: ExamTakerAction): PaginationState => {
  switch (action.type) {
    case 'TOGGLE_PAGINATION':
      return {
        ...state,
        paginated: !state.paginated,
        page: findBestPageCoordIdx(state.pageCoords, state.spyCoords[state.spy]),
      };
    case 'VIEW_QUESTION': {
      // If paginated, find the most specific page and switch to it.
      let { page } = state;
      if (state.paginated) {
        page = findBestPageCoordIdx(state.pageCoords, action.coords);
      }
      return {
        ...state,
        page,
      };
    }
    case 'SPY_QUESTION':
      return {
        ...state,
        spy: findBestPageCoordIdx(state.spyCoords, action.coords),
      };
    case 'PREV_QUESTION': {
      const page = state.page - 1;
      return {
        ...state,
        page,
        spy: findBestPageCoordIdx(state.spyCoords, state.pageCoords[page]),
      };
    }
    case 'NEXT_QUESTION': {
      const page = state.page + 1;
      return {
        ...state,
        page,
        spy: findBestPageCoordIdx(state.spyCoords, state.pageCoords[page]),
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
        // Only include parts if there are multiple of them,
        // or if the solo part isn't anonymous
        if (q.parts.length > 1 || q.parts[0]?.name?.value) {
          q.parts.forEach((_p, pnum) => {
            const thisP = {
              question: qnum,
              part: pnum,
            };
            spyCoords.push(thisP);
            if (q.separateSubparts) pageCoords.push(thisP);
          });
        }
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
