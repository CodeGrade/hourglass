import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ReactQuillProps } from 'react-quill';
import { HTMLVal } from '@student/exams/show/types';
import { EditHTMLVal } from '@professor/exams/new/editor/components/helpers';

const Prompted: React.FC<{
  disabled?: boolean;
  value: HTMLVal;
  onChange: (newVal: HTMLVal) => void;
  debounceDelay?: number;
  className?: string;
  theme?: ReactQuillProps['theme'];
}> = (props) => {
  const {
    value,
    disabled = false,
    debounceDelay = 1000,
    onChange,
    theme,
    className = 'bg-white',
  } = props;

  return (
    <>
      <Form.Group as={Row}>
        <Form.Label column sm={2}>Prompt</Form.Label>
        <Col sm={10}>
          <EditHTMLVal
            disabled={disabled}
            className={className}
            value={value}
            debounceDelay={debounceDelay}
            theme={theme}
            placeholder="Provide any instructions for this specific item..."
            onChange={onChange}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default Prompted;
