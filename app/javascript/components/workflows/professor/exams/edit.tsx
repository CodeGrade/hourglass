import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponse as showExam } from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import Editor from '@professor/exams/new/editor';

const EditExam: React.FC<{}> = () => {
  const { examId } = useParams();
  const res = showExam(examId);
  switch (res.type) {
    case 'ERROR':
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <Editor
          exam={res.response.contents.exam}
          answers={res.response.contents.answers}
          railsExam={{
            name: res.response.exam.name,
            id: examId,
            policies: res.response.exam.policies,
          }}
        />
      );
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

export default EditExam;
