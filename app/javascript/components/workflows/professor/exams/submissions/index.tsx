import React from 'react';
import {
  useParams,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import ExamViewer from '@hourglass/workflows/proctor/registrations/show';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '@hourglass/relay/environment';
import { submissionsAllQuery } from './__generated__/submissionsAllQuery.graphql';
import { submissionsOneQuery } from './__generated__/submissionsOneQuery.graphql';
import { AnswersState, ExamFile, HTMLVal, FileRef, QuestionInfo, ContentsState } from '@hourglass/workflows/student/exams/show/types';

const ExamSubmissions: React.FC = () => {
  const { examId } = useParams();
  return (
    <QueryRenderer<submissionsAllQuery>
      environment={environment}
      query={graphql`
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
        `}
      variables={{
        examId,
      }}
      render={({ error, props }) => {
        if (error) {
          return <p>Error</p>;
        }
        if (!props) {
          return <p>Loading...</p>;
        }
        return (
          <ul>
            {props.exam.finalRegistrations.map((reg) => (
              <li key={reg.id}>
                <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                  {reg.user.displayName}
                </Link>
              </li>
            ))}
          </ul>
        );
      }}
    />
  );
};

const ExamSubmission: React.FC = () => {
  const { registrationId } = useParams();
  return (
    <QueryRenderer<submissionsOneQuery>
      environment={environment}
      query={graphql`
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
        `}
      variables={{
        registrationId,
      }}
      render={({ error, props }) => {
        if (error) {
          return <p>Error</p>;
        }
        if (!props) {
          return <p>Loading...</p>;
        }
        const { registration } = props;
        const { examVersion, currentAnswers } = registration;
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
            <h1>{`Submission by ${props.registration.user.displayName}`}</h1>
            <ExamViewer contents={parsedContents} />
          </>
        );
      }}
    />
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
