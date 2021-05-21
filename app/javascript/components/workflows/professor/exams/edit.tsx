import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Editor from '@hourglass/workflows/professor/exams/new/old-editor';
import { useAlert } from '@hourglass/common/alerts';
import { useQuery, graphql } from 'relay-hooks';
import {
  ContentsState,
  Policy,
  QuestionInfo,
  HTMLVal,
  ExamFile,
  AnswerState,
} from '@student/exams/show/types';
import { RenderError } from '@hourglass/common/boundary';

import { editVersionQuery } from './__generated__/editVersionQuery.graphql';

const EditExamVersion: React.FC = () => {
  const { versionId } = useParams<{ versionId: string }>();
  const res = useQuery<editVersionQuery>(
    graphql`
    query editVersionQuery($examVersionId: ID!) {
      examVersion(id: $examVersionId) {
        id
        name
        policies
        dbQuestions {
          name {
            type
            value
          }
          description {
            type
            value
          }
          extraCredit
          separateSubparts
          references {
            type
            path
          }
          parts {
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
        dbReferences {
          type
          path
        }
        instructions {
          type
          value
        }
        files
        answers
        anyStarted
        anyFinalized
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
    res.data?.examVersion?.anyStarted || res.data?.examVersion?.anyFinalized,
    [res.data?.examVersion?.anyStarted || res.data?.examVersion?.anyFinalized],
  );
  if (res.error) {
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.data) {
    return <Container><p>Loading...</p></Container>;
  }
  const { examVersion } = res.data;
  const parsedContents: ContentsState = {
    exam: {
      questions: examVersion.dbQuestions as QuestionInfo[],
      references: examVersion.dbReferences,
      instructions: examVersion.instructions as HTMLVal,
      files: examVersion.files as ExamFile[],
    },
    answers: {
      answers: examVersion.answers as AnswerState[][][],
      scratch: '',
    },
  };
  return (
    <Container>
      <Editor
        examVersionId={examVersion.id}
        exam={parsedContents.exam}
        versionName={examVersion.name}
        versionPolicies={examVersion.policies as readonly Policy[]}
        answers={parsedContents.answers}
      />
    </Container>
  );
};

export default EditExamVersion;
