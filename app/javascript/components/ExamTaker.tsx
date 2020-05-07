import React, { useContext } from 'react';
import {
  ExamNavbar,
  RegularNavbar,
} from '@hourglass/components/navbar';
import { Row, Col, Container } from 'react-bootstrap';
import { RailsContext } from '@hourglass/context';
import ExamShowContents from '@hourglass/containers/ExamShowContents';
import PreStart from '@hourglass/containers/PreStart';

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
    <>
      <ExamNavbar />
      <Row>
        <Col>
          <ExamShowContents
            railsExam={railsExam}
          />
        </Col>
      </Row>
    </>
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
