import React from 'react';
import {
  Row, Col, Form,
} from 'react-bootstrap';
import { TextInfo, TextState } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';

interface TextProps {
  info: TextInfo;
  value?: TextState;
}

const Text: React.FC<TextProps> = (props) => {
  const {
    info,
    value,
  } = props;
  const { prompt } = info;
  let theRest;
  if (!value) {
    theRest = (
      <>
        <b>Answer: </b>
        <i>No answer given</i>
      </>
    );
  } else {
    theRest = (
      <Form.Control
        disabled
        as="textarea"
        rows={3}
        placeholder="Enter your answer here."
        value={value}
      />
    );
  }
  return (
    <>
      <Row>
        <Col>
          <HTML value={prompt} />
        </Col>
      </Row>
      <Row>
        <Col>
          {theRest}
        </Col>
      </Row>
    </>
  );
};

export default Text;
