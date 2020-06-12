import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponse as showVersion } from '@hourglass/common/api/professor/exams/versions/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import Editor from '@professor/exams/new/editor';
import { useAlert } from '@hourglass/common/alerts';

const EditExamVersion: React.FC = () => {
  const { versionId } = useParams();
  const res = showVersion(versionId);
  useAlert(
    {
      variant: 'warning',
      title: 'Version has finalized students.',
      message: 'Changing structure of the version will likely result in unexpected behavior.',
    },
    res.type === 'RESULT' && res.response.anyFinalized,
    [res.type],
  );
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
