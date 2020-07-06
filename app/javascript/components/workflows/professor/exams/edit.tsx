import React from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@professor/exams/new/editor';
import { useAlert } from '@hourglass/common/alerts';
import { useQuery, graphql } from 'relay-hooks';
import { ContentsState, Policy } from '@hourglass/workflows/student/exams/show/types';

import { editVersionQuery } from './__generated__/editVersionQuery.graphql';

const EditExamVersion: React.FC = () => {
  const { versionId } = useParams();
  const realRes = useQuery<editVersionQuery>(
    graphql`
    query editVersionQuery($examVersionRailsId: Int!) {
      examVersion(railsId: $examVersionRailsId) {
        railsId
        name
        policies
        contents
        anyStarted
      }
    }
    `,
    {
      examVersionRailsId: Number(versionId),
    },
  );
  useAlert(
    {
      variant: 'warning',
      title: 'Students have already started taking this version',
      message: 'Changing the questions will likely result in nonsensical answers, and changing the structure of this version will result in undefined behavior. Be careful!',
    },
    realRes.props?.examVersion?.anyStarted,
    [realRes.props?.examVersion?.anyStarted],
  );
  if (realRes.error) {
    throw realRes.error;
  }
  if (!realRes.props) {
    return <p>Loading...</p>;
  }
  const { examVersion } = realRes.props;
  const parsedContents = JSON.parse(examVersion.contents) as ContentsState;
  return (
    <Editor
      exam={parsedContents.exam}
      answers={parsedContents.answers}
      railsExamVersion={{
        name: examVersion.name,
        id: examVersion.railsId,
        policies: examVersion.policies as readonly Policy[],
      }}
    />
  );
};

export default EditExamVersion;
