import React from 'react';
import ShowQuestion from '@proctor/registrations/show/ShowQuestion';
import { CurrentGrading } from '@professor/exams/types';
import { graphql, useFragment } from 'react-relay';

import { DisplayQuestions$key } from './__generated__/DisplayQuestions.graphql';

interface DisplayQuestionsProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  valueUpdate: React.DependencyList;
  currentGrading?: CurrentGrading;
  registrationId?: string;
  fullyExpandCode: boolean;
  overviewMode: boolean;
  version: DisplayQuestions$key;
  classNameDecorator?: (qnum: number, pnum: number, bnum: number) => string;
}

const DisplayQuestions: React.FC<DisplayQuestionsProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    valueUpdate,
    currentGrading = [],
    registrationId,
    fullyExpandCode,
    overviewMode,
    version,
    classNameDecorator,
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
          valueUpdate={valueUpdate}
          registrationId={registrationId}
          fullyExpandCode={fullyExpandCode}
          overviewMode={overviewMode}
          classNameDecorator={classNameDecorator}
        />
      ))}
    </>
  );
};
export default DisplayQuestions;
