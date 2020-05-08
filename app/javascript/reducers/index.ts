import { combineReducers } from 'redux';

import lockdown from './lockdown';
import contents from './contents';
import snapshot from './snapshot';
import messages from './messages';

export default combineReducers({
  lockdown,
  contents,
  snapshot,
  messages,
});
