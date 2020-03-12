import React, { useReducer } from "react";

/*
state:
{
    0: {
        0: {
            1: "a",
        }
    }
}

action:
{
    type: "updateAnswer",
    qnum: 0,
    pnum: 1,
    bnum: 3,
    val: "new value",
}
*/

function reducer(state, action) {
  switch (action.type) {
    case "updateAnswer":
      let ret = { ...state };
      ret[action.qnum] = { ...ret[action.qnum] };
      ret[action.qnum][action.pnum] = { ...ret[action.qnum][action.pnum] };
      ret[action.qnum][action.pnum][action.bnum] = action.val;
      return ret;
  }
}

const getAtPath = state => (qnum, pnum, bnum) => {
  return state?.[qnum]?.[pnum]?.[bnum];
};

export function useExamState() {
  const [examState, dispatch] = useReducer(reducer, {});
  return [getAtPath(examState), dispatch];
}
