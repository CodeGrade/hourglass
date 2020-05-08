import React from 'react';
import { Form } from 'react-bootstrap';

interface ScratchProps {
  value: string;
  onChange: (newVal: string) => void;
}

const Scratch: React.FC<ScratchProps> = (props) => {
  const {
    value,
    onChange,
  } = props;
  return (
    <Form.Control
      value={value}
      onChange={(event): void => {
        onChange(event.target.value);
      }}
      as="textarea"
    />
  );
};

export default Scratch;
