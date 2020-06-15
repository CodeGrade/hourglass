import React, { useState, useContext, useEffect } from 'react';
import {
  Collapse,
  InputGroup,
  Button,
} from 'react-bootstrap';
import { FileRef } from '@hourglass/workflows/student/exams/show/types';
import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { ExamContext } from '@hourglass/workflows/student/exams/show/context';
import { getFilesForRefs } from '@hourglass/workflows/student/exams/show/files';
import FilePickerSelect from './FilePicker';

const ExamReference: React.FC<{
  value: FileRef[];
  onChange: (newVal: FileRef[]) => void;
}> = (props) => {
  const {
    onChange,
    value,
  } = props;
  const [open, setOpen] = useState(false);
  const noFiles = value.length === 0;
  const { files, fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, value);
  return (
    <>
      <p>Choose files to be shown for the entire exam</p>
      <InputGroup>
        <div className="flex-grow-1">
          <FilePickerSelect options={files} selected={value} onChange={onChange} />
        </div>
        <InputGroup.Append>
          <Button
            variant="info"
            disabled={noFiles}
            onClick={(): void => setOpen((o) => !o)}
          >
            Preview files
            {open && !noFiles ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </Button>
        </InputGroup.Append>
      </InputGroup>
      <Collapse in={open && !noFiles}>
        <div className="border">
          <VeryControlledFileViewer files={filteredFiles} />
        </div>
      </Collapse>
    </>
  );
};

export default ExamReference;
