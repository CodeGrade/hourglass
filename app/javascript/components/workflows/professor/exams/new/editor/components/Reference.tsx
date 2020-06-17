import React, { useContext } from 'react';
import {
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import { WrappedFieldProps } from 'redux-form';
import { ExamContext } from '@student/exams/show/context';
import { FilePickerSelectWithPreview } from '@professor/exams/new/editor/components/FilePicker';

const EditReference: React.FC<{
  label: string;
} & WrappedFieldProps> = (props) => {
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
    <Row>
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
    </Row>
  );
};

export default EditReference;
