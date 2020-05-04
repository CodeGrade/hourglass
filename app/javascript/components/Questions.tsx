import React from 'react';
import { Question } from '@hourglass/types';
import ShowQuestion from '@hourglass/components/ShowQuestion';
import Pagination from '@hourglass/components/Pagination';

interface QuestionsProps {
  questions: Question[];
  paginated: boolean;
  selectedQuestion: number;
}

const Questions: React.FC<QuestionsProps> = (props) => {
  const {
    questions,
    paginated,
    selectedQuestion,
  } = props;
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
    />
  );
}
export default Questions;
