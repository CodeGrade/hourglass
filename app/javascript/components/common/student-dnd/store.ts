import { createStore, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { reducer as formReducer } from 'redux-form';

const composeEnhancers = composeWithDevTools({
  trace: true,
  traceLimit: 25,
});

const reduxEnhancers = composeEnhancers();

const rootReducer = combineReducers({
  form: formReducer,
});

export default createStore(rootReducer, reduxEnhancers);
