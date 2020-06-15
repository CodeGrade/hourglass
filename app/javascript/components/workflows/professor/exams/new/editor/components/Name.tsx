import React from 'react';
import {
  Form,
  Row,
  Col,
} from 'react-bootstrap';

const ExamName: React.FC<{
  value: string;
  onChange: (newVal: string) => void;
}> = (props) => {
  const {
    onChange,
    value,
  } = props;
  return (
    <Form.Group as={Row} controlId="examTitle">
      <Form.Label column sm="3"><h2>Version name:</h2></Form.Label>
      <Col>
        <Form.Control
          size="lg"
          type="text"
          placeholder="Enter a name for this version"
          value={value}
          onChange={(e): void => onChange(e.target.value)}
        />
      </Col>
    </Form.Group>
  );
};

export default ExamName;
