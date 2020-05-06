import React from 'react';
import { QuestionInfo } from '@hourglass/types';
import ShowQuestion from '@hourglass/components/ShowQuestion';
import Pagination from '@hourglass/components/Pagination';
import SubmitButton from '@hourglass/containers/SubmitButton';
import { useExamInfoContext } from '@hourglass/context';

interface QuestionsProps {
  questions: QuestionInfo[];
  paginated: boolean;
  selectedQuestion: number;
}

const Questions: React.FC<QuestionsProps> = (props) => {
  const {
    questions,
    paginated,
    selectedQuestion,
  } = props;
  const { railsExam } = useExamInfoContext();
  const { id } = railsExam;
  return (
    <Pagination
      current={selectedQuestion}
      paginated={paginated}
      max={questions.length}
      endItem={<SubmitButton examID={id} />}
    >
      {questions.map((q, i) => (
        <ShowQuestion
          // Question numbers are STATIC.
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          question={q}
          qnum={i}
        />
      ))}
    </Pagination>
  );
};
export default Questions;
