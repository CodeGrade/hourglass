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

//function initState(files, { questions }) {
//  const ret = {};
//  questions.forEach((q, qnum) => {
//    ret[qnum] = {};
//    q.parts.forEach((p, pnum) => {
//      ret[qnum][pnum] = {};
//      p.body.forEach((b, bnum) => {
//        //if (b) is an object... else ....
//        ret[qnum][pnum][bnum] = {};
//      });
//    });
//  })
//  return ret;
//}

export function useExamState(files, info) {
  const [examState, dispatch] = useReducer(reducer, {});
  return [getAtPath(examState), dispatch];
}
