import React from 'react';
import {
  Row, Col, Form,
} from 'react-bootstrap';

interface TextProps {
  value: string;
  onChange: (newVal: string) => void;
}

const Instructions: React.FC<TextProps> = (props) => {
  const {
    value,
    onChange,
  } = props;
  return (
    <Row className="py-3">
      <Col>
        <p>Give exam-wide instructions here</p>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter your answer here."
          value={value}
          onChange={(e): void => {
            const elem = e.target as HTMLTextAreaElement;
            onChange(elem.value);
          }}
        />
      </Col>
    </Row>
  );
};

export default Instructions;
