import React from 'react';
import { Provider } from 'react-redux';
import { Container } from 'react-bootstrap';
import store from '@student/exams/show/store';
import RegularNavbar from '@hourglass/common/navbar';
import { useParams, Redirect } from 'react-router-dom';
import ExamTaker from '@student/exams/show/containers/ExamTaker';
import ExamSubmitted from '@student/exams/show/components/ExamSubmitted';
import DocumentTitle from '@hourglass/common/documentTitle';
import { graphql, useFragment, useQuery } from 'relay-hooks';
import { RenderError } from '@hourglass/common/boundary';

import { showQuery } from './__generated__/showQuery.graphql';
import { showConfirmActiveQuery } from './__generated__/showConfirmActiveQuery.graphql';
import { showExam$key } from './__generated__/showExam.graphql';

interface ShowExamProps {
  examKey: showExam$key;
}

const Exam: React.FC<ShowExamProps> = (props) => {
  const {
    examKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment showExam on Exam {
      ...ExamSubmitted
      ...ExamTaker
      id
      myRegistration {
        final
      }
    }
    `,
    examKey,
  );
  return (
    <Provider store={store}>
      {res.myRegistration.final ? <ExamSubmitted examKey={res} /> : <ExamTaker examKey={res} />}
    </Provider>
  );
};

const ShowExam: React.FC = () => {
  const { examId } = useParams();
  const confirmActive = useQuery<showConfirmActiveQuery>(
    graphql`
    query showConfirmActiveQuery {
      me {
        currentRegistrations {
          exam { id }
        }
        priorRegistrations {
          exam {
            id
            myRegistration { id }
          }
        }
      }
    }
    `,
  );
  if (confirmActive.error) {
    return (
      <>
        <RegularNavbar />
        <Container>
          <RenderError error={confirmActive.error} />
        </Container>
      </>
    );
  }

  if (!confirmActive.props) {
    return (
      <>
        <RegularNavbar />
        <Container>
          <p>Loading...</p>
        </Container>
      </>
    );
  }

  const myPriorReg = confirmActive.props.me.priorRegistrations.find((e) => e.exam.id === examId);
  if (myPriorReg) {
    return (
      <Redirect to={`/exams/${examId}/submissions/${myPriorReg.exam.myRegistration.id}`} />
    );
  }
  if (!confirmActive.props.me.currentRegistrations.some((e) => e.exam.id === examId)) {
    return (
      <>
        <RegularNavbar />
        <Container>
          <span className="text-danger">
            <p>There is no such exam available for you to take.</p>
          </span>
        </Container>
      </>
    );
  }
  const res = useQuery<showQuery>(
    graphql`
    query showQuery($examId: ID!) {
      exam(id: $examId) {
        name
        myRegistration {
          id
        }
        ...showExam
      }
    }
    `,
    { examId },
  );
  if (res.error) {
    return (
      <>
        <RegularNavbar />
        <Container>
          <RenderError error={res.error} />
        </Container>
      </>
    );
  }
  if (!res.props) {
    return (
      <>
        <RegularNavbar />
        <Container>
          <p>Loading...</p>
        </Container>
      </>
    );
  }
  if (!res.props.exam.myRegistration) {
    return (
      <Redirect to="/" />
    );
  }
  return (
    <DocumentTitle title={res.props.exam.name}>
      <Exam examKey={res.props.exam} />
    </DocumentTitle>
  );
};

export default ShowExam;
