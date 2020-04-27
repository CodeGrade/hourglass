import { combineReducers } from 'redux';
import { answers } from './answers.ts';
import { snapshot } from './snapshot.ts';

const rootReducer = combineReducers({
  answers,
  snapshot,
});

export default rootReducer;
