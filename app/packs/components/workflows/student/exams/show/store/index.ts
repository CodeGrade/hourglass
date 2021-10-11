import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import ReduxThunk from 'redux-thunk';
import rootReducer from '@student/exams/show/reducers';

const composeEnhancers = composeWithDevTools({
  trace: true,
  traceLimit: 25,
});

const reduxEnhancers = composeEnhancers(
  applyMiddleware(ReduxThunk),
);

export default createStore(rootReducer, reduxEnhancers);
