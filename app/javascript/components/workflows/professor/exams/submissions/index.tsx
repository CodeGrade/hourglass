import React from 'react';
import {
  useParams,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import ExamViewer from '@hourglass/workflows/proctor/registrations/show';
import { graphql } from 'react-relay';
import {
  AnswersState,
  ExamFile,
  HTMLVal,
  FileRef,
  QuestionInfo,
  ContentsState,
} from '@hourglass/workflows/student/exams/show/types';
import { useQuery } from 'relay-hooks';
import { RenderError } from '@hourglass/common/boundary';

import { submissionsAllQuery } from './__generated__/submissionsAllQuery.graphql';
import { submissionsOneQuery } from './__generated__/submissionsOneQuery.graphql';

const ExamSubmissions: React.FC = () => {
  const { examId } = useParams();
  const res = useQuery<submissionsAllQuery>(
    graphql`
    query submissionsAllQuery($examId: ID!) {
      exam(id: $examId) {
        finalRegistrations {
          id
          user {
            displayName
          }
        }
      }
    }
    `,
    { examId },
  );
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.props) {
    return <p>Loading...</p>;
  }
  return (
    <ul>
      {res.props.exam.finalRegistrations.map((reg) => (
        <li key={reg.id}>
          <Link to={`/exams/${examId}/submissions/${reg.id}`}>
            {reg.user.displayName}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const ExamSubmission: React.FC = () => {
  const { registrationId } = useParams();
  const res = useQuery<submissionsOneQuery>(
    graphql`
    query submissionsOneQuery($registrationId: ID!) {
      registration(id: $registrationId) {
        currentAnswers
        user {
          displayName
        }
        examVersion {
          questions
          reference
          instructions
          files
          answers
        }
      }
    }
    `,
    { registrationId },
  );
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.props) {
    return <p>Loading...</p>;
  }
  const { registration } = res.props;
  const { examVersion, currentAnswers, user } = registration;
  const parsedContents: ContentsState = {
    exam: {
      questions: examVersion.questions as QuestionInfo[],
      reference: examVersion.reference as FileRef[],
      instructions: examVersion.instructions as HTMLVal,
      files: examVersion.files as ExamFile[],
    },
    answers: currentAnswers as AnswersState,
  };
  return (
    <>
      <h1>{`Submission by ${user.displayName}`}</h1>
      <ExamViewer contents={parsedContents} />
    </>
  );
};

const Submissions: React.FC = () => (
  <Switch>
    <Route path="/exams/:examId/submissions/:registrationId">
      <ExamSubmission />
    </Route>
    <Route path="/exams/:examId/submissions">
      <ExamSubmissions />
    </Route>
  </Switch>
);

export default Submissions;
