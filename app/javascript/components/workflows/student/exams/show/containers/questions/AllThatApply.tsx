import AllThatApply from '@student/exams/show/components/questions/AllThatApply';
import { connectWithPath } from './connectors';

const AllThatApplyConnected = connectWithPath(AllThatApply);
AllThatApplyConnected.displayName = 'AllThatApplyConnected';
export default AllThatApplyConnected;
AllThatApply.whyDidYouRender = true;
