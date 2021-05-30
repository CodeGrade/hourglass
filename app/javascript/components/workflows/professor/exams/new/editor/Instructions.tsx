import React from 'react';
import {
  Row, Col,
} from 'react-bootstrap';
import { HTMLVal } from '@student/exams/show/types';
import { EditHTMLVal } from './components/helpers';

interface TextProps {
  value: HTMLVal;
  disabled?: boolean;
  onChange: (newVal: HTMLVal) => void;
}

const Instructions: React.FC<TextProps> = (props) => {
  const {
    value,
    disabled = false,
    onChange,
  } = props;
  return (
    <Row className="py-3">
      <Col>
        <p>Exam instructions</p>
        <EditHTMLVal
          className="bg-white"
          value={value}
          disabled={disabled}
          theme="snow"
          placeholder="Give exam-wide instructions here"
          onChange={onChange}
          debounceDelay={1000}
        />
      </Col>
    </Row>
  );
};

export default Instructions;
