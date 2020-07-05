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

const ExamSubmissions: React.FC = () => {
  const { examId } = useParams();
  return (
    <QueryRenderer<submissionsAllQuery>
      environment={environment}
      query={graphql`
        query submissionsAllQuery($examRailsId: Int!) {
          exam(railsId: $examRailsId) {
            finalRegistrations {
              railsId
              user {
                displayName
              }
            }
          }
        }
        `}
      variables={{
        examRailsId: Number(examId),
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
              <li key={reg.railsId}>
                <Link to={`/exams/${examId}/submissions/${reg.railsId}`}>
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
  const { examId, registrationId } = useParams();
  return (
    <QueryRenderer<submissionsOneQuery>
      environment={environment}
      query={graphql`
        query submissionsOneQuery($examRailsId: Int!, $registrationRailsId: Int!) {
          exam(railsId: $examRailsId) {
            railsRegistration(railsId: $registrationRailsId) {
              currentAnswers
              user {
                displayName
              }
              examVersion {
                contents
              }
            }
          }
        }
        `}
      variables={{
        examRailsId: Number(examId),
        registrationRailsId: Number(registrationId),
      }}
      render={({ error, props }) => {
        if (error) {
          return <p>Error</p>;
        }
        if (!props) {
          return <p>Loading...</p>;
        }
        return (
          <>
            <h1>{`Submission by ${props.exam.registration.user.displayName}`}</h1>
            <ExamViewer
              railsExam={{
                id: 0,
                name: 'not used',
                policies: [],
              }}
              contents={{
                exam: JSON.parse(props.exam.registration.examVersion.contents).exam,
                answers: JSON.parse(props.exam.registration.currentAnswers),
              }}
            />
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
