import React, { useContext } from 'react';
import {
  ExamNavbar,
  RegularNavbar,
} from '@hourglass/components/navbar';
import { Row, Col, Container } from 'react-bootstrap';
import { RailsContext } from '@hourglass/context';
import ExamShowContents from '@hourglass/containers/ExamShowContents';
import PreStart from '@hourglass/containers/PreStart';
import './ExamTaker.scss';

interface ExamTakerProps {
  ready: boolean;
}

const ExamTaker: React.FC<ExamTakerProps> = (props) => {
  const {
    ready,
  } = props;
  const {
    railsExam,
    railsUser,
  } = useContext(RailsContext);
  const body = ready ? (
    <div id="exam-taker" className="d-flex">
      <ExamNavbar />
      <Container fluid className="flex-fill">
        <Row
          id="exam-body"
          className="py-3"
        >
          <Col>
            <ExamShowContents
              railsExam={railsExam}
            />
          </Col>
        </Row>
      </Container>
    </div>
  ) : (
    <>
      <RegularNavbar
        railsUser={railsUser}
      />
      <Container>
        <PreStart
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
