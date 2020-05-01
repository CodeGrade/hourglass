import { createStore } from 'redux';
import { applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';
import rootReducer from '@hourglass/reducers';

const composeEnhancers = composeWithDevTools({
  trace: true,
  traceLimit: 25,
});

const reduxEnhancers = composeEnhancers(
  applyMiddleware(ReduxThunk),
);


export default createStore(rootReducer, reduxEnhancers);
