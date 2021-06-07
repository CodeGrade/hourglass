import React, { useContext } from 'react';
import {
  Form,
  Col,
} from 'react-bootstrap';
import { ExamContext } from '@hourglass/common/context';
import { FilePickerSelectWithPreview } from '@professor/exams/new/editor/components/FilePicker';
import { FileRef } from '@student/exams/show/types';

const EditReference: React.FC<{
  label: string;
  value: readonly FileRef[];
  disabled?: boolean;
  onChange: (newVal: FileRef[]) => void;
}> = (props) => {
  const {
    label,
    value,
    disabled = false,
    onChange,
  } = props;
  const { files, fmap } = useContext(ExamContext);

  return (
    <>
      <Form.Label column sm={2}>
        {`Files to be shown for ${label}:`}
      </Form.Label>
      <Col sm={10}>
        <FilePickerSelectWithPreview
          options={files}
          selected={value}
          onChange={(newRefs) => {
            // Filter out references that no longer exist.
            const filtered = newRefs.filter((fileRef) => (fileRef.path in fmap));
            onChange(filtered);
          }}
          disabled={disabled}
        />
      </Col>
    </>
  );
};

export default EditReference;
