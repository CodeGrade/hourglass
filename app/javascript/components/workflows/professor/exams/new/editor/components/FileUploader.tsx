import React, { useState, useRef } from 'react';
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
  const noFiles = value === undefined || value.length === 0;
  const [fileLabel, setFileLabel] = useState<string>(noFiles ? 'Choose a file' : 'Saved files');
  const [open, setOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>();
  return (
    <Form.Group as={Row}>
      <Col sm={12}>
        <p>All exam files</p>
        <InputGroup>
          <Form.File
            ref={fileInput}
            onChange={(e): void => {
              const { target } = e;
              const { files: uploaded } = target;
              const upload = uploaded[0];
              if (!upload) return;
              handleZip(upload).then(onChange).then(() => {
                setFileLabel(upload.name);
              });
            }}
            label={fileLabel}
            accept="application/zip"
            custom
          />
          <InputGroup.Append>
            <Button
              variant="danger"
              disabled={noFiles}
              onClick={(): void => {
                setOpen(false);
                setFileLabel('Choose a file');
                onChange([]);
                if (fileInput.current) {
                  fileInput.current.value = null;
                }
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
            <VeryControlledFileViewer
              deps={[open]}
              files={value}
            />
          </div>
        </Collapse>
      </Col>
    </Form.Group>
  );
};

export default FileUploader;
