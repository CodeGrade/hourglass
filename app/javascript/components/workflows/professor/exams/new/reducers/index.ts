import { Reducer, combineReducers } from 'redux';

import contents from './contents';
import name from './name';
import policies from './policies';
import { ExamEditorState, ExamEditorAction } from '../types';

const reducer: Reducer<ExamEditorState, ExamEditorAction> = combineReducers({
  contents,
  name,
  policies,
});

export default reducer;
