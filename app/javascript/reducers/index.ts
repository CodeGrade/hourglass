import { combineReducers } from 'redux';
import { answers } from './answers';
import { snapshot } from './snapshot';

const rootReducer = combineReducers({
  answers,
  snapshot,
});

export default rootReducer;
