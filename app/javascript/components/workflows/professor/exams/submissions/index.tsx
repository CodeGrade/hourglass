import React from 'react';
import {
  useParams,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import { Container } from 'react-bootstrap';
import ExamViewer from '@proctor/registrations/show';
import { graphql } from 'react-relay';
import {
  AnswersState,
  ExamFile,
  HTMLVal,
  FileRef,
  QuestionInfo,
  ContentsState,
} from '@student/exams/show/types';
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
        notStartedRegistrations {
          id
          user {
            displayName
          }
        }
        startedRegistrations {
          id
          user {
            displayName
          }
        }
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
  const {
    notStartedRegistrations,
    startedRegistrations,
    finalRegistrations,
  } = res.props.exam;
  return (
    <>
      <h4>Completed submissions</h4>
      {finalRegistrations.length === 0 ? (
        <i>No completed submissions yet</i>
      ) : (
        <ul>
          {finalRegistrations.map((reg) => (
            <li key={reg.id}>
              <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                {reg.user.displayName}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <h4>Started submissions</h4>
      {startedRegistrations.length === 0 ? (
        <i>No one has started yet</i>
      ) : (
        <ul>
          {startedRegistrations.map((reg) => (
            <li key={reg.id}>
              <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                {reg.user.displayName}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <h4>Not-yet-started submissions</h4>
      {notStartedRegistrations.length === 0 ? (
        <i>Everyone has started</i>
      ) : (
        <ul>
          {notStartedRegistrations.map((reg) => (
            <li key={reg.id}>
              <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                {reg.user.displayName}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
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
  <Container>
    <Switch>
      <Route path="/exams/:examId/submissions/:registrationId">
        <ExamSubmission />
      </Route>
      <Route path="/exams/:examId/submissions">
        <ExamSubmissions />
      </Route>
    </Switch>
  </Container>
);

export default Submissions;
