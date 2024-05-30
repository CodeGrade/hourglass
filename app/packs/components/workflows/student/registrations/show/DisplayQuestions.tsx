import React from 'react';
import ShowQuestion from '@proctor/registrations/show/ShowQuestion';
import { CurrentGrading } from '@professor/exams/types';
import { graphql, useFragment } from 'react-relay';

import { CourseRole } from '@grading/__generated__/gradingRoleQuery.graphql';
import { DisplayQuestions$key } from './__generated__/DisplayQuestions.graphql';

interface DisplayQuestionsProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  valueUpdate: React.DependencyList;
  currentGrading?: CurrentGrading;
  registrationId?: string;
  courseRole?: CourseRole
  fullyExpandCode: boolean;
  overviewMode: boolean;
  rubricsOpen: boolean;
  version: DisplayQuestions$key;
  classNameDecorator?: (qnum: number, pnum: number, bnum: number) => string;
}

const DisplayQuestions: React.FC<DisplayQuestionsProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    valueUpdate,
    currentGrading = [],
    courseRole = 'STUDENT',
    registrationId,
    fullyExpandCode,
    rubricsOpen,
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
          courseRole={courseRole}
          fullyExpandCode={fullyExpandCode}
          overviewMode={overviewMode}
          rubricsOpen={rubricsOpen}
          classNameDecorator={classNameDecorator}
        />
      ))}
    </>
  );
};
export default DisplayQuestions;
