import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponse as showExam } from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import Editor from '@professor/exams/new/editor';

const EditExam: React.FC = () => {
  const { examId, versionId } = useParams();
  const res = showExam(examId, []);
  switch (res.type) {
    case 'ERROR':
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT': {
      const version = res.response.versions.find((v) => v.id.toString() === versionId);
      if (!version) return <p>No such version.</p>;
      return (
        <Editor
          exam={version.contents.exam}
          answers={version.contents.answers}
          railsExam={{
            name: res.response.name,
            id: examId,
            policies: version.policies,
          }}
        />
      );
    }
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

export default EditExam;
