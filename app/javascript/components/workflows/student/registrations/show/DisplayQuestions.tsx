import React from 'react';
import ShowQuestion from '@proctor/registrations/show/ShowQuestion';
import { CurrentGrading } from '@professor/exams/types';
import { graphql, useFragment } from 'relay-hooks';

import { DisplayQuestions$key } from './__generated__/DisplayQuestions.graphql';

interface DisplayQuestionsProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  currentGrading?: CurrentGrading;
  registrationId?: string;
  fullyExpandCode: boolean;
  overviewMode: boolean;
  version: DisplayQuestions$key;
}

const DisplayQuestions: React.FC<DisplayQuestionsProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    currentGrading = [],
    registrationId,
    fullyExpandCode,
    overviewMode,
    version,
  } = props;
  const res = useFragment(
    graphql`
    fragment DisplayQuestions on ExamVersion {
      dbQuestions {
        id
        ...ShowQuestion
      }
    }
    `,
    version,
  );
  return (
    <>
      {res.dbQuestions.map((q, i) => (
        <ShowQuestion
          key={q.id}
          questionKey={q}
          qnum={i}
          currentGrading={currentGrading[i]}
          refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
          registrationId={registrationId}
          fullyExpandCode={fullyExpandCode}
          overviewMode={overviewMode}
        />
      ))}
    </>
  );
};
export default DisplayQuestions;
