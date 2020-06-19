import MultipleChoice from '@student/exams/show/components/questions/MultipleChoice';
import { connectWithPath } from './connectors';

const MultipleChoiceConnected = connectWithPath(MultipleChoice);
MultipleChoiceConnected.displayName = 'MultipleChoiceConnected';
export default MultipleChoiceConnected;
MultipleChoice.whyDidYouRender = true;
