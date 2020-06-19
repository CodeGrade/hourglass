import CodeTag from '@student/exams/show/components/questions/CodeTag';
import { connectWithPath } from './connectors';

const CodeTagConnected = connectWithPath(CodeTag);
CodeTagConnected.displayName = 'CodeTagConnected';
export default CodeTagConnected;
CodeTag.whyDidYouRender = true;
