import { combineReducers } from 'redux';

import contents from './contents';
import railsExam from './metadata';


export default combineReducers({
  contents,
  railsExam,
});
