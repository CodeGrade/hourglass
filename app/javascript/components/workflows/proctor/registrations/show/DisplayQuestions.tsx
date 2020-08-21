import React from 'react';
import { QuestionInfo } from '@student/exams/show/types';
import ShowQuestion from '@proctor/registrations/show/ShowQuestion';
import { CurrentGrading } from '@professor/exams/types';

interface DisplayQuestionsProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  questions: QuestionInfo[];
  currentGrading?: CurrentGrading;
}

const DisplayQuestions: React.FC<DisplayQuestionsProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    currentGrading = [],
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
          currentGrading={currentGrading[i]}
          refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
        />
      ))}
    </>
  );
};
export default DisplayQuestions;
