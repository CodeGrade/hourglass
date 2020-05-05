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
  const { exam, preview } = useExamInfoContext();
  const { id } = exam;
  const body = questions.map((q, i) => (
    <ShowQuestion
      question={q}
      qnum={i}
    />
  ));
  return (
    <Pagination
      current={selectedQuestion}
      paginated={paginated}
      body={body}
      max={questions.length}
      endItem={!preview && <SubmitButton examID={id} />}
    />
  );
};
export default Questions;
