import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponse as examsShow } from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';

const ExamAdmin: React.FC<{}> = () => {
  const { examId } = useParams();
  const res = examsShow(examId);
  switch (res.type) {
    case 'ERROR':
      return (
        <span
          className="text-danger"
        >
          {res.text}
        </span>
      );
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <>
          <h2>{res.response.name}</h2>
        </>
      );
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

export default ExamAdmin;
