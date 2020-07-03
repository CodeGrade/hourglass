import React from 'react';
import { Provider } from 'react-redux';
import { Container } from 'react-bootstrap';
import store from '@student/exams/show/store';
import RegularNavbar from '@hourglass/common/navbar';
import { useParams, useHistory, Redirect } from 'react-router-dom';
import {
  RailsExamVersion,
  RailsUser,
  RailsRegistration,
  RailsCourse,
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

  // Information about the registration.
  railsRegistration: RailsRegistration;

  // Information about the course.
  railsCourse: RailsCourse;

  // Whether the exam is complete.
  final: boolean;

  lastSnapshot?: DateTime;
}

const Exam: React.FC<ShowExamProps> = (props) => {
  const {
    railsUser,
    railsExam,
    railsRegistration,
    railsCourse,
    final,
    lastSnapshot,
  } = props;
  return (
    <RailsContext.Provider
      value={{
        railsExam,
        railsRegistration,
        railsUser,
        railsCourse,
      }}
    >
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
        query showQuery($railsId: Int!) {
          me {
            displayName
          }
          exam(railsId: $railsId) {
            railsId
            name
            course {
              railsId
            }
            myRegistration {
              railsId
              final
              lastSnapshotTime
              anomalous
              examVersion {
                policies
              }
            }
          }
        }
        `}
      variables={{
        railsId: Number(examId),
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
          id: props.exam.railsId,
          name: props.exam.name,
          policies: props.exam.myRegistration.examVersion.policies,
        };
        const railsRegistration: RailsRegistration = {
          id: props.exam.myRegistration.railsId,
          anomalous: props.exam.myRegistration.anomalous,
        };
        const railsCourse: RailsCourse = {
          id: props.exam.course.railsId,
        };
        const { final, lastSnapshotTime } = props.exam.myRegistration;
        const lastSnapshot = lastSnapshotTime ? DateTime.fromISO(lastSnapshotTime) : undefined;
        return (
          <DocumentTitle title={props.exam.name}>
            <Exam
              railsUser={railsUser}
              railsExam={railsExam}
              railsCourse={railsCourse}
              railsRegistration={railsRegistration}
              final={final}
              lastSnapshot={lastSnapshot}
            />
          </DocumentTitle>
        );
      }}
    />
  );
};

export default ShowExam;
