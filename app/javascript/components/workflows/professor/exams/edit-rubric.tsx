import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import RubricEditor from '@professor/exams/new/rubric-editor';
import { useQuery, graphql } from 'relay-hooks';
import {
  ContentsState,
  QuestionInfo,
  ExamFile,
  AnswerState,
} from '@student/exams/show/types';
import { RenderError } from '@hourglass/common/boundary';

import { editRubricQuery } from './__generated__/editRubricQuery.graphql';

const EditExamVersionRubric: React.FC = () => {
  const { versionId } = useParams<{ versionId: string }>();
  const res = useQuery<editRubricQuery>(
    graphql`
    query editRubricQuery($examVersionId: ID!) {
      examVersion(id: $examVersionId) {
        id
        name
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
      }
    }
    `,
    {
      examVersionId: versionId,
    },
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
      instructions: examVersion.instructions,
      files: examVersion.files as ExamFile[],
    },
    answers: {
      answers: examVersion.answers as AnswerState[][][],
      scratch: '',
    },
  };
  return (
    <Container fluid>
      <RubricEditor
        examVersionId={examVersion.id}
        exam={parsedContents.exam}
        versionName={examVersion.name}
        answers={parsedContents.answers}
      />
    </Container>
  );
};

export default EditExamVersionRubric;
