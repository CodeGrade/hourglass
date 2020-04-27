import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

import rootReducer from '../reducers';
import { AnswerState, StatePath, Exam, ExamState, Files, FileMap, AnswersState } from '../types';
import { createMap } from '../files';

export const getAtPath = (state: ExamState, ...path: StatePath): AnswerState => {
  let ret = state.answers;
  for (const elem of path) {
    ret = ret?.[elem];
  }
  return ret;
};

function initState(info: Exam, fmap: FileMap): AnswersState {
  const ret = {};
  info.questions.forEach((q, qi) => {
    ret[qi] = {};
    q.parts.forEach((p, pi) => {
      ret[qi][pi] = {};
      p.body.forEach((b, bi) => {
        if (b.type == 'Code') {
          const f = fmap[b.initial];
          if (f?.filedir == 'file') {
            ret[qi][pi][bi] = f.contents;
          }
        }
      });
    })
  });
  return ret;
}

export function examStore(files: Files, info: Exam) {
  const fmap = createMap(files);
  const initialState = initState(info, fmap);
  return createStore(rootReducer, { answers: initialState }, composeWithDevTools(
    applyMiddleware(ReduxThunk)
  ));
}
