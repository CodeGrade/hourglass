import React, { useReducer, useContext } from "react";

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
*/

interface ExamState {
  [qnum: number]: {
    [pnum: number]: {
      [bnum: number]: any;
    }
  }
}

type StatePath = Array<number | string>;

interface UpdateAnswerAction {
  type: "updateAnswer",
  path: StatePath;
  val: any
}
type Action = UpdateAnswerAction;

function reducer(state: ExamState, action: Action) {
  switch (action.type) {
    case "updateAnswer":
      const ret = { ...state };
      let cur = ret;
      for (let i = 0; i < action.path.length - 1; i++) {
        cur[action.path[i]] = { ...cur[action.path[i]] };
        cur = cur[action.path[i]];
      }
      cur[action.path[action.path.length - 1]] = action.val;
      return ret;
    default:
      console.log("Got a different action type: " + action.type);
      return state;
  }
}

const getAtPath = (state: ExamState) => (...path: StatePath) => {
  let ret = state;
  for (const elem of path) {
    ret = ret?.[elem];
  }
  return ret;
};

function initState(files: Files, info: Exam): ExamState {
  const ret = {};
  info.questions.forEach((q, qi) => {
    ret[qi] = {};
    q.parts.forEach((p, pi) => {
      ret[qi][pi] = {};
      p.body.forEach((b, bi) => {
        switch (b.type) {
          case 'Code':
            ret[qi][pi][bi] = b.initial; // TODO: get contents
            break;
          default:
            break;
        }
      });
    })
  });
  return ret;
}

interface ExamContext {
  getAtPath: (...path: StatePath) => any;
  dispatch: (action: Action) => void;
  files: Files;
}

export function useExamState(files: Files, info: Exam) {
  const [examState, dispatch] = useReducer(reducer, initState(files, info));
  return {
    getAtPath: getAtPath(examState),
    dispatch,
  };
}

const ctx = React.createContext<Partial<ExamContext>>({});
ctx.displayName = "ExamContext";
export const useExamContext = () => useContext(ctx);
export const ExamContextProvider = ctx.Provider;
