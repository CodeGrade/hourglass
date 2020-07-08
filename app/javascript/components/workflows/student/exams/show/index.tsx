import React from 'react';
import { Provider } from 'react-redux';
import { Container } from 'react-bootstrap';
import store from '@student/exams/show/store';
import RegularNavbar from '@hourglass/common/navbar';
import { useParams, Redirect } from 'react-router-dom';
import {
  RailsExamVersion,
  RailsUser,
  Policy,
} from '@student/exams/show/types';
import ExamTaker from '@student/exams/show/containers/ExamTaker';
import ExamSubmitted from '@student/exams/show/components/ExamSubmitted';
import { RailsContext } from '@student/exams/show/context';
import { DateTime } from 'luxon';
import DocumentTitle from '@hourglass/common/documentTitle';
import { QueryRenderer } from 'react-relay';
import environment from '@hourglass/relay/environment';
import { graphql } from 'relay-hooks';
import { showQuery } from './__generated__/showQuery.graphql';

interface ShowExamProps {
  // The current logged-in user.
  railsUser: RailsUser;

  // Information about the exam.
  railsExam: RailsExamVersion;

  anomalous: boolean;

  over: boolean;

  // Whether the exam is complete.
  final: boolean;

  lastSnapshot?: DateTime;
}

const Exam: React.FC<ShowExamProps> = (props) => {
  const {
    railsUser,
    railsExam,
    anomalous,
    over,
    final,
    lastSnapshot,
  } = props;
  const railsContext = React.useMemo(() => ({
    railsExam,
    anomalous,
    over,
    railsUser,
    lastSnapshot,
  }), [
    // TODO: move railsExam fields up
    // NOTE: no good way to check array-equality of policies here
    ...Object.values(railsExam),
    anomalous,
    over,
    ...Object.values(railsUser),
    lastSnapshot.toISO(),
  ]);
  return (
    <RailsContext.Provider value={railsContext}>
      <Provider store={store}>
        {final ? <ExamSubmitted lastSnapshot={lastSnapshot} /> : <ExamTaker />}
      </Provider>
    </RailsContext.Provider>
  );
};

const ShowExam: React.FC = () => {
  const { examId } = useParams();
  return (
    <QueryRenderer<showQuery>
      environment={environment}
      query={graphql`
        query showQuery($examId: ID!) {
          me {
            displayName
          }
          exam(id: $examId) {
            takeUrl
            questionsUrl
            messagesUrl
            name
            myRegistration {
              final
              lastSnapshot
              anomalous
              over
              examVersion {
                policies
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
          return (
            <>
              <RegularNavbar />
              <Container>
                <span className="text-danger">{error.message}</span>
              </Container>
            </>
          );
        }
        if (!props) {
          return (
            <>
              <RegularNavbar />
              <Container>
                <p>Loading...</p>
              </Container>
            </>
          );
        }
        if (!props.exam.myRegistration) {
          return (
            <Redirect to="/" />
          );
        }
        const railsUser: RailsUser = {
          displayName: props.me.displayName,
        };
        const railsExam: RailsExamVersion = {
          takeUrl: props.exam.takeUrl,
          questionsUrl: props.exam.questionsUrl,
          messagesUrl: props.exam.messagesUrl,
          name: props.exam.name,
          policies: props.exam.myRegistration.examVersion.policies as Policy[],
        };
        const {
          final,
          over,
          anomalous,
          lastSnapshot,
        } = props.exam.myRegistration;
        const parsedLastSnapshot = lastSnapshot ? DateTime.fromISO(lastSnapshot) : undefined;
        return (
          <DocumentTitle title={props.exam.name}>
            <Exam
              railsUser={railsUser}
              railsExam={railsExam}
              over={over}
              anomalous={anomalous}
              final={final}
              lastSnapshot={parsedLastSnapshot}
            />
          </DocumentTitle>
        );
      }}
    />
  );
};

export default ShowExam;
