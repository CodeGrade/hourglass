import React from 'react';
import { QuestionInfo } from '@student/exams/show/types';
import ShowQuestion from '@proctor/registrations/show/ShowQuestion';
import { CurrentGrading } from '@professor/exams/types';
import { graphql, useFragment } from 'relay-hooks';

import { DisplayQuestionsStudent$key } from './__generated__/DisplayQuestionsStudent.graphql';

interface DisplayQuestionsProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  currentGrading?: CurrentGrading;
  registrationId?: string;
  fullyExpandCode: boolean;
  overviewMode: boolean;
  version: DisplayQuestionsStudent$key;
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
    fragment DisplayQuestionsStudent on ExamVersion {
      dbQuestions {
        id
        name {
          type
          value
        }
        rootRubric @include(if: $withRubric) { ...ShowRubricKey } 
        description {
          type
          value
        }
        separateSubparts
        references {
          type
          path
        }
        parts {
          id
          name {
            type
            value
          }
          description {
            type
            value
          }
          points
          references {
            type
            path
          }
          bodyItems {
            id
            info
          }
        }
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
          question={q as QuestionInfo}
          qnum={i}
          currentGrading={currentGrading[i]}
          refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
          registrationId={registrationId}
          fullyExpandCode={fullyExpandCode}
          overviewMode={overviewMode}
          rubricKey={q.rootRubric}
        />
      ))}
    </>
  );
};
export default DisplayQuestions;
