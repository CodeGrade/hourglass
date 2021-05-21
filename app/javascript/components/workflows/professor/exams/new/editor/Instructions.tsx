import React, { useCallback } from 'react';
import {
  Row, Col,
} from 'react-bootstrap';
import CustomEditor from '@hourglass/workflows/professor/exams/new/old-editor/components/CustomEditor';
import { HTMLVal } from '@student/exams/show/types';

interface TextProps {
  value: HTMLVal;
  onChange: (newVal: HTMLVal) => void;
}

const Instructions: React.FC<TextProps> = (props) => {
  const {
    value,
    onChange,
  } = props;
  const handleChange = useCallback((newVal, _delta, source, _editor): void => {
    if (source === 'user') {
      onChange(newVal);
    }
  }, [onChange]);
  return (
    <Row className="py-3">
      <Col>
        <p>Exam instructions</p>
        <CustomEditor
          className="bg-white"
          value={value.value}
          placeholder="Give exam-wide instructions here"
          onChange={handleChange}
        />
      </Col>
    </Row>
  );
};

export default Instructions;