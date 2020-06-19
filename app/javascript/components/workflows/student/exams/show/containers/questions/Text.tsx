import Text from '@student/exams/show/components/questions/Text';
import { connectWithPath } from './connectors';

const TextConnected = connectWithPath(Text);
TextConnected.displayName = 'TextConnected';
export default TextConnected;
Text.whyDidYouRender = true;
