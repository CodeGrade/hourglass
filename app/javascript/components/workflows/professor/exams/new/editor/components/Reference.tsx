import React, { useContext } from 'react';
import {
  Form,
  Col,
} from 'react-bootstrap';
import { WrappedFieldProps } from 'redux-form';
import { ExamContext } from '@student/exams/show/context';
import { FilePickerSelectWithPreview } from '@professor/exams/new/editor/components/FilePicker';

const EditReference: React.FC<{
  label: string;
} & WrappedFieldProps> = React.memo((props) => {
  const {
    label,
    input,
  } = props;
  const {
    value,
    onChange,
  } = input;
  const { files } = useContext(ExamContext);
  return (
    <>
      <Form.Label column sm={2}>
        {`Files to be shown for ${label}:`}
      </Form.Label>
      <Col sm={10}>
        <FilePickerSelectWithPreview
          options={files}
          selected={value}
          onChange={onChange}
        />
      </Col>
    </>
  );
}, (prev, next) => (
  prev.label === next.label
  && prev.input.value === next.input.value
  && prev.input.onChange === next.input.onChange
));

export default EditReference;
