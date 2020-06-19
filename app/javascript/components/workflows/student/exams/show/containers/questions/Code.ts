import Code from '@student/exams/show/components/questions/Code';
import { connectWithPath } from './connectors';

const CodeConnected = connectWithPath(Code);
CodeConnected.displayName = 'CodeConnected';
export default CodeConnected;
Code.whyDidYouRender = true;
