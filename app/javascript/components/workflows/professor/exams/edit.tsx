import React from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@professor/exams/new/editor';
import { useAlert } from '@hourglass/common/alerts';
import { useQuery, graphql } from 'relay-hooks';
import { ContentsState, Policy } from '@hourglass/workflows/student/exams/show/types';

import { editVersionQuery } from './__generated__/editVersionQuery.graphql';

const EditExamVersion: React.FC = () => {
  const { versionId } = useParams();
  const res = useQuery<editVersionQuery>(
    graphql`
    query editVersionQuery($examVersionId: ID!) {
      examVersion(id: $examVersionId) {
        id
        name
        policies
        contents
        anyStarted
      }
    }
    `,
    {
      examVersionId: versionId,
    },
  );
  useAlert(
    {
      variant: 'warning',
      title: 'Students have already started taking this version',
      message: 'Changing the questions will likely result in nonsensical answers, and changing the structure of this version will result in undefined behavior. Be careful!',
    },
    res.props?.examVersion?.anyStarted,
    [res.props?.examVersion?.anyStarted],
  );
  if (res.error) {
    throw res.error;
  }
  if (!res.props) {
    return <p>Loading...</p>;
  }
  const { examVersion } = res.props;
  const parsedContents: ContentsState = JSON.parse(examVersion.contents);
  return (
    <Editor
      examVersionId={examVersion.id}
      exam={parsedContents.exam}
      versionName={examVersion.name}
      versionPolicies={examVersion.policies as readonly Policy[]}
      answers={parsedContents.answers}
    />
  );
};

export default EditExamVersion;
