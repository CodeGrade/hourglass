import {
  applyMiddleware,
  createStore,
  Store,
} from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import ReduxThunk from 'redux-thunk';
import rootReducer from '@professor/exams/new/reducers';
import { ExamEditorState, ExamEditorAction } from '../types';

const composeEnhancers = composeWithDevTools({
  trace: true,
  traceLimit: 25,
});

const reduxEnhancers = composeEnhancers(
  applyMiddleware(ReduxThunk),
);


const create = (
  start,
): Store<ExamEditorState, ExamEditorAction> => createStore(rootReducer, start, reduxEnhancers);

export default create;
