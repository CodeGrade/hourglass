import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Editor from '@professor/exams/new/editor';
import { useAlert } from '@hourglass/common/alerts';
import { useQuery, graphql } from 'relay-hooks';
import {
  ContentsState,
  Policy,
  QuestionInfo,
  FileRef,
  HTMLVal,
  ExamFile,
  AnswerState,
} from '@hourglass/workflows/student/exams/show/types';
import { RenderError } from '@hourglass/common/boundary';

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
        questions
        reference
        instructions
        files
        answers
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
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.props) {
    return <Container><p>Loading...</p></Container>;
  }
  const { examVersion } = res.props;
  const parsedContents: ContentsState = {
    exam: {
      questions: examVersion.questions as QuestionInfo[],
      reference: examVersion.reference as FileRef[],
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
