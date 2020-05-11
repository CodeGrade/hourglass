import React from 'react';
import { Form } from 'react-bootstrap';
import './Scratch.css';

interface ScratchProps {
  value: string;
  onChange?: (newVal: string) => void;
  disabled?: boolean;
}

const Scratch: React.FC<ScratchProps> = (props) => {
  const {
    value,
    onChange,
    disabled = false,
  } = props;
  return (
    <Form.Control
      id="scratchbox"
      value={value}
      onChange={(event): void => {
        onChange(event.target.value);
      }}
      as="textarea"
      disabled={disabled}
    />
  );
};

export default Scratch;
