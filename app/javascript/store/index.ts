import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

import rootReducer from '../reducers';
import {
  AnswerState, StatePath, Exam, ExamState, Files, FileMap, AnswersState,
} from '../types';
import { createMap } from '../files';

export const getAtPath = (state, ...path: StatePath): AnswerState => {
  let ret = state.answers;
  for (const elem of path) {
    ret = ret?.[elem];
  }
  return ret;
};

export function examStore() {
  return createStore(rootReducer, composeWithDevTools(
    applyMiddleware(ReduxThunk),
  ));
}
