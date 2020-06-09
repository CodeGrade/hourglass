import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponse as showVersion } from '@hourglass/common/api/professor/exams/versions/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import Editor from '@professor/exams/new/editor';

const EditExamVersion: React.FC = () => {
  const { versionId } = useParams();
  const res = showVersion(versionId);
  switch (res.type) {
    case 'ERROR':
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT': {
      const version = res.response;
      if (!version) return <p>No such version.</p>;
      return (
        <Editor
          exam={version.contents.exam}
          answers={version.contents.answers}
          railsExamVersion={{
            name: version.name,
            id: version.id,
            policies: version.policies,
          }}
        />
      );
    }
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

export default EditExamVersion;
