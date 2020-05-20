import React from 'react';
import { QuestionInfo } from '@examTaker/types';
import ShowQuestion from '@examTaker/components/ShowQuestion';

interface DisplayQuestionsProps {
  questions: QuestionInfo[];
}

const DisplayQuestions: React.FC<DisplayQuestionsProps> = (props) => {
  const {
    questions,
  } = props;
  return (
    <>
      {questions.map((q, i) => (
        <ShowQuestion
          // Question numbers are STATIC.
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          question={q}
          qnum={i}
          paginated={false}
          displayOnly
        />
      ))}
    </>
  );
};
export default DisplayQuestions;
