import Matching from '@student/exams/show/components/questions/Matching';
import { connectWithPath } from './connectors';

const MatchingConnected = connectWithPath(Matching);
MatchingConnected.displayName = 'MatchingConnected';
export default MatchingConnected;
Matching.whyDidYouRender = true;
