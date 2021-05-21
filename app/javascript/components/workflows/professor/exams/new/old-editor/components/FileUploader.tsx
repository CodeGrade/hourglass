import React, { useState, useRef, useEffect } from 'react';
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
import { WrappedFieldProps } from 'redux-form';

const FileUploader: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
    meta,
  } = props;
  const { pristine } = meta;
  const { value, onChange }: {
    value: ExamFile[];
    onChange: (files: ExamFile[]) => void;
  } = input;
  const noFiles = value === undefined || value.length === 0;
  const [uploadedFileName, setUploadedFileName] = useState<string>(undefined);
  useEffect(() => {
    if (pristine) setUploadedFileName(undefined);
  }, [pristine]);
  const uploadLabel = noFiles ? 'Choose a file' : 'Saved files';
  const label = uploadedFileName ?? uploadLabel;
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
                setUploadedFileName(upload.name);
              });
            }}
            label={label}
            accept="application/zip"
            custom
          />
          <InputGroup.Append>
            <Button
              variant="danger"
              disabled={noFiles}
              onClick={(): void => {
                setOpen(false);
                setUploadedFileName(undefined);
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
