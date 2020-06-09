import { combineReducers } from 'redux';

import contents from './contents';
import name from './name';
import policies from './policies';

export default combineReducers({
  contents,
  name,
  policies,
});
