import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Form,
  Button,
  Collapse,
  InputGroup,
} from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import {
  ExamFile,
} from '@student/exams/show/types';
import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
import { handleZip } from '@hourglass/common/archive';

interface FileUploaderProps {
  value: ExamFile[];
  onChange: (files: ExamFile[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = (props) => {
  const { value, onChange } = props;
  const [file, setFile] = useState<File>(undefined);
  const [open, setOpen] = useState(false);
  const noFiles = value === undefined || value.length === 0;
  useEffect(() => {
    if (!file) return;
    handleZip(file).then(onChange);
  }, [file]);
  const curLabel = file?.name ?? (noFiles ? 'Choose a file' : 'Saved files');
  return (
    <Form.Group as={Row}>
      <Col sm={12}>
        <p>All exam files</p>
        <InputGroup>
          <Form.File
            required
            onChange={(e): void => {
              const { files: uploaded } = e.target;
              const upload = uploaded[0];
              if (upload) setFile(upload);
            }}
            label={curLabel}
            accept="application/zip,.yaml,.yml"
            custom
          />
          <InputGroup.Append>
            <Button
              variant="danger"
              disabled={noFiles}
              onClick={(): void => {
                setOpen(false);
                setFile(undefined);
                onChange([]);
              }}
            >
              Clear files
            </Button>
            <Button
              variant="info"
              disabled={noFiles}
              onClick={(): void => setOpen((o) => !o)}
            >
              Preview files
              {open ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Col>
      <Col sm={12}>
        <Collapse in={open}>
          <div className="border">
            <VeryControlledFileViewer files={value} />
          </div>
        </Collapse>
      </Col>
    </Form.Group>
  );
};

export default FileUploader;
