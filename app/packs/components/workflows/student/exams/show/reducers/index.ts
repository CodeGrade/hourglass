import { combineReducers } from 'redux';

import lockdown from './lockdown';
import contents from './contents';
import pagination from './pagination';
import snapshot from './snapshot';

export default combineReducers({
  lockdown,
  contents,
  pagination,
  snapshot,
});
