import YesNo from '@student/exams/show/components/questions/YesNo';
import { connectWithPath } from './connectors';

const YesNoConnected = connectWithPath(YesNo);
YesNoConnected.displayName = 'YesNoConnected';
export default YesNoConnected;
YesNo.whyDidYouRender = true;
