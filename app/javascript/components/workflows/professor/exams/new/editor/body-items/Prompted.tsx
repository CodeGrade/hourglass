import React, { useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import CustomEditor from '@professor/exams/new/old-editor/components/CustomEditor';
import { HTMLVal } from '@student/exams/show/types';

const Prompted: React.FC<{
  value: HTMLVal;
  disabled?: boolean;
  onChange: (newVal: HTMLVal) => void;
}> = (props) => {
  const {
    value,
    disabled = false,
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
            disabled={disabled}
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

export default Prompted;
