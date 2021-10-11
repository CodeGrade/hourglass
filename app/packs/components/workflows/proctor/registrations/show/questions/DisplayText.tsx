import React from 'react';
import { Form } from 'react-bootstrap';
import { TextInfo, TextState } from '@student/exams/show/types';

interface TextProps {
  info: TextInfo;
  value?: TextState;
}

const Text: React.FC<TextProps> = (props) => {
  const {
    value,
  } = props;
  if (!value) {
    return (
      <>
        <b>Answer: </b>
        <i>No answer given</i>
      </>
    );
  }
  return (
    <Form.Control
      disabled
      as="textarea"
      rows={3}
      placeholder="Enter your answer here."
      value={value}
    />
  );
};

export default Text;
