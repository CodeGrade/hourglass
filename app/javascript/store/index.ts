import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

import rootReducer from '@hourglass/reducers';
import {
  AnswerState, StatePath, Exam, ExamState, Files, FileMap, AnswersState,
} from '../types';
import { createMap } from '@hourglass/files';

export const getAtPath = (state, ...path: StatePath): AnswerState => {
  let ret = state.answers;
  for (const elem of path) {
    ret = ret?.[elem];
  }
  return ret;
};

export function examStore() {
  const composeEnhancers = composeWithDevTools({
    trace: true,
    traceLimit: 25,
  });
  return createStore(rootReducer, composeEnhancers(
    applyMiddleware(ReduxThunk),
  ));
}
