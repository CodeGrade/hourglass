import React, { useContext } from 'react';
import ExamNavbar from '@student/exams/show/components/navbar';
import RegularNavbar from '@hourglass/common/navbar';
import { Row, Col, Container } from 'react-bootstrap';
import { RailsContext } from '@student/exams/show/context';
import ExamShowContents from '@student/exams/show/containers/ExamShowContents';
import PreStart from '@student/exams/show/containers/PreStart';
import './ExamTaker.scss';

interface ExamTakerProps {
  ready: boolean;
}

const ExamTaker: React.FC<ExamTakerProps> = (props) => {
  const {
    ready,
  } = props;
  const {
    railsCourse,
    railsExam,
  } = useContext(RailsContext);
  const body = ready ? (
    <div id="exam-taker" className="d-flex">
      <ExamNavbar />
      <Container fluid className="flex-fill transition">
        <Row
          id="exam-body"
          className="py-3"
        >
          <Col>
            <ExamShowContents
              railsCourse={railsCourse}
              railsExam={railsExam}
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
          railsCourse={railsCourse}
          railsExam={railsExam}
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
