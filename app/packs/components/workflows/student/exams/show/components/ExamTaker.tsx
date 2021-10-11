import React from 'react';
import ExamNavbar from '@student/exams/show/containers/navbar';
import RegularNavbar from '@hourglass/common/navbar';
import { Row, Col, Container } from 'react-bootstrap';
import ExamShowContents from '@student/exams/show/containers/ExamShowContents';
import PreStart from '@student/exams/show/containers/PreStart';
import { Policy } from '@student/exams/show/types';
import './ExamTaker.scss';
import { useFragment, graphql } from 'relay-hooks';

import { ExamTaker$key } from './__generated__/ExamTaker.graphql';

interface ExamTakerProps {
  examKey: ExamTaker$key;
  ready: boolean;
}

const ExamTaker: React.FC<ExamTakerProps> = (props) => {
  const {
    examKey,
    ready,
  } = props;
  const res = useFragment(
    graphql`
    fragment ExamTaker on Exam {
      ...PreStart
      ...ExamShowContents
      ...navbar
      id
      takeUrl
      myRegistration {
        examVersion {
          policies
        }
      }
    }
    `,
    examKey,
  );
  const body = ready ? (
    <div id="exam-taker" className="d-flex">
      <ExamNavbar examKey={res} />
      <Container fluid className="flex-fill transition">
        <Row
          id="exam-body"
          className="py-3"
        >
          <Col>
            <ExamShowContents
              examKey={res}
              examTakeUrl={res.takeUrl}
            />
          </Col>
        </Row>
      </Container>
    </div>
  ) : (
    <>
      <RegularNavbar />
      <Container>
        <PreStart
          examKey={res}
          policies={res.myRegistration.examVersion.policies as readonly Policy[]}
          examTakeUrl={res.takeUrl}
        />
      </Container>
    </>
  );
  return (
    <>
      {body}
    </>
  );
};
export default ExamTaker;
