import React, { useReducer } from "react";

/*
state:
{
    0: { // qnum
        0: { // pnum
            1: // bnum
              "a", // answer for that body item
        }
    }
}

action:
{
    type: "updateAnswer",
    path: [0, 1, 3],
    val: "new value",
}
*/

interface Action {
  type: string,
  path: Array<number | string>,
  val: any
}

function reducer(state, action : Action) {
  switch (action.type) {
    case "updateAnswer":
      const ret = { ...state };
      let cur = ret;
      for (let i = 0; i < action.path.length - 1; i++) {
        cur[action.path[i]] = { ... cur[action.path[i]] };
        cur = cur[action.path[i]];
      }
      cur[action.path[action.path.length - 1]] = action.val;
      return ret;
    default:
      console.log("Got a different action type: " + action.type);
      return state;
  }
}

const getAtPath = (state) => (...path) => {
  let ret = state;
  for (const elem of path) {
    ret = ret?.[elem];
  }
  return ret;
};

export function useExamState(files, info) {
  const [examState, dispatch] = useReducer(reducer, {});
  return [getAtPath(examState), dispatch];
}
