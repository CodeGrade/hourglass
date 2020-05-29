import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Form,
} from 'react-bootstrap';
import {
  ExamFile,
} from '@student/exams/show/types';
import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
import { handleZip } from '@hourglass/common/archive';

interface FileUploaderProps {
  files: ExamFile[];
  onChange: (files: ExamFile[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = (props) => {
  const { files, onChange } = props;
  const [file, setFile] = useState<File>(undefined);
  useEffect(() => {
    if (!file) return;
    handleZip(file).then(onChange);
  }, [file]);
  return (
    <Form>
      <Form.Group as={Row}>
        <Col sm={12}>
          <Form.File
            required
            onChange={(e): void => {
              const { files: uploaded } = e.target;
              const upload = uploaded[0];
              if (upload) setFile(upload);
            }}
            label={file?.name ?? 'Choose a file'}
            accept="application/zip,.yaml,.yml"
            custom
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Col sm={12}>
          <VeryControlledFileViewer files={files} />
        </Col>
      </Form.Group>
    </Form>
  );
};

export default FileUploader;
