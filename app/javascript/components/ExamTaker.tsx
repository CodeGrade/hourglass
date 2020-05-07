import React, { useContext } from 'react';
import {
  ExamNavbar,
  RegularNavbar,
} from '@hourglass/components/navbar';
import { Row, Col } from 'react-bootstrap';
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
    <Row>
      <Col className="bg-dark text-white" md="2">
        <ExamNavbar />
      </Col>
      <Col md="10">
        <ExamShowContents
          railsExam={railsExam}
        />
      </Col>
    </Row>
  ) : (
    <>
      <RegularNavbar
        railsUser={railsUser}
      />
      <PreStart
        railsExam={railsExam}
      />
    </>
  );
  return (
    <>
      {body}
    </>
  );
};
export default ExamTaker;
