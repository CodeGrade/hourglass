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
  const { examId } = useParams<{ examId: string }>();

  const res = useQuery<showQuery>(
    graphql`
    query showQuery($examId: ID!) {
      exam(id: $examId) {
        name
        myRegistration {
          over
          inFuture
          available
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
  if (!res.data) {
    return (
      <>
        <RegularNavbar />
        <Container>
          <p>Loading...</p>
        </Container>
      </>
    );
  }
  const { myRegistration } = res.data.exam;
  if (!myRegistration) {
    return (
      <Redirect to="/" />
    );
  }
  if (myRegistration.over) {
    return (
      <Redirect to={`/exams/${examId}/submissions/${myRegistration.id}`} />
    );
  }
  if (!myRegistration.available) {
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

  return (
    <DocumentTitle title={res.data.exam.name}>
      <Exam examKey={res.data.exam} />
    </DocumentTitle>
  );
};

export default ShowExam;
