import React from 'react';
import { QuestionInfo } from '@student/exams/show/types';
import ShowQuestion from '@proctor/registrations/show/ShowQuestion';
import { CurrentGrading } from '@professor/exams/types';
import { graphql, useFragment } from 'relay-hooks';

import { DisplayQuestions$key } from './__generated__/DisplayQuestions.graphql';

interface DisplayQuestionsProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  currentGrading?: CurrentGrading;
  showRequestGrading?: string;
  fullyExpandCode: boolean;
  showStarterCode: boolean;
  version: DisplayQuestions$key;
}

const DisplayQuestions: React.FC<DisplayQuestionsProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    currentGrading = [],
    showRequestGrading,
    fullyExpandCode,
    showStarterCode,
    version,
  } = props;
  const res = useFragment(
    graphql`
    fragment DisplayQuestions on ExamVersion {
      dbQuestions {
        id
        name
        description
        separateSubparts
        references {
          type
          path
        }
        parts {
          id
          name
          description
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
          // Question numbers are STATIC.
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          question={q as QuestionInfo}
          qnum={i}
          currentGrading={currentGrading[i]}
          refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
          showRequestGrading={showRequestGrading}
          fullyExpandCode={fullyExpandCode}
          showStarterCode={showStarterCode}
        />
      ))}
    </>
  );
};
export default DisplayQuestions;
