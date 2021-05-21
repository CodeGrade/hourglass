import React, { useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import CustomEditor from '@hourglass/workflows/professor/exams/new/old-editor/components/CustomEditor';
import { HTMLVal } from '@hourglass/workflows/student/exams/show/types';

const EditPrompt: React.FC<{
  value: HTMLVal;
  onChange: (newVal: HTMLVal) => void;
}> = (props) => {
  const {
    value,
    onChange,
  } = props;
  const handleChange = useCallback((newVal: string, _delta, source, _editor): void => {
    if (source === 'user') {
      onChange({
        type: 'HTML',
        value: newVal,
      });
    }
  }, [onChange]);
  return (
    <>
      <Form.Group as={Row}>
        <Form.Label column sm={2}>Prompt</Form.Label>
        <Col sm={10}>
          <CustomEditor
            className="bg-white"
            value={value.value}
            placeholder="Provide any instructions for this specific item..."
            onChange={handleChange}
          />
        </Col>
      </Form.Group>
    </>
  );
};

const Prompted: React.FC<{
  prompt: HTMLVal;
}> = (props) => {
  const {
    prompt,
  } = props;
  return (
    <EditPrompt
      value={prompt}
      onChange={console.log}
    />
  );
};

export default Prompted;
