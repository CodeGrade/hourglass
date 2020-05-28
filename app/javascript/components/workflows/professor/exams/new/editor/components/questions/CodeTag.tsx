import React, { useEffect, useState } from 'react';
import { FileRef, CodeTagInfo, CodeTagState } from '@student/exams/show/types';
import {
  Row, Col, Modal, Button,
} from 'react-bootstrap';
import { ControlledFileViewer } from '@student/exams/show/components/FileViewer';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import HTML from '@student/exams/show/components/HTML';

interface CodeTagValProps {
  value: CodeTagState;
}

const CodeTagVal: React.FC<CodeTagValProps> = (props) => {
  const { value } = props;
  return (
    <div>
      <span className="mr-2">
        <b className="mr-2">File:</b>
        {value?.selectedFile
          ? (
            <Button disabled size="sm" variant="outline-dark">
              {value.selectedFile}
            </Button>
        )
          : <i>Unanswered</i>}
      </span>
      <span>
        <b className="mr-2">Line:</b>
        {value?.lineNumber
          ? (
            <Button disabled size="sm" variant="outline-dark">
              {value.lineNumber}
            </Button>
        )
          : <i>Unanswered</i>}
      </span>
    </div>
  );
};

export { CodeTagVal };

interface FileModalProps {
  references: FileRef[];
  show: boolean;
  onClose: () => void;
  onSave: (newState: CodeTagState) => void;
  startValue: CodeTagState;
  disabled: boolean;
}

const FileModal: React.FC<FileModalProps> = (props) => {
  const {
    show,
    onClose,
    onSave,
    references,
    startValue,
    disabled,
  } = props;
  // Modal has its own state so the user can manipulate it before saving.
  const [selected, setSelected] = useState(startValue);
  const [refresher, setRefresher] = useState(false);
  const refreshCodeMirror = (): void => setRefresher((b) => !b);
  useEffect(() => {
    // Reset my starting state when outer state changes.
    setSelected(startValue);
  }, [startValue]);
  const saveEnabled = selected?.selectedFile && selected?.lineNumber;
  const saveButtonDisabled = disabled || !saveEnabled;
  const disabledMessage = disabled
    ? 'Lost connection to server...'
    : 'Please choose a file and line to save.';
  return (
    <Modal
      show={show}
      onEscapeKeyDown={onClose}
      onHide={onClose}
      onEntering={refreshCodeMirror}
      dialogClassName="w-100 mw-100 m-2"
      centered
      keyboard
    >
      <Modal.Header closeButton>
        <Modal.Title>Choose a line</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ControlledFileViewer
          refreshProps={[refresher]}
          references={references}
          selection={selected}
          onChangeFile={(newFile): void => {
            setSelected({
              selectedFile: newFile,
              lineNumber: undefined,
            });
          }}
          onChangeLine={(newLine): void => {
            setSelected((old) => ({
              selectedFile: old.selectedFile,
              lineNumber: newLine,
            }));
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <div className="mr-auto">
          <CodeTagVal value={selected} />
        </div>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <TooltipButton
          disabled={saveButtonDisabled}
          disabledMessage={disabledMessage}
          variant="primary"
          onClick={(): void => onSave(selected)}
        >
          Save Changes
        </TooltipButton>
      </Modal.Footer>
    </Modal>
  );
};

interface CodeTagProps {
  info: CodeTagInfo;
  value: CodeTagState;
  onChange: (newVal: CodeTagState) => void;
  disabled: boolean;
}

const CodeTag: React.FC<CodeTagProps> = (props) => {
  const {
    info,
    value,
    onChange,
    disabled,
  } = props;
  const { choices, prompt } = info;
  const [showModal, setShowModal] = useState(false);
  return (
    <Row>
      <Col>
        {prompt
         && (
         <Row>
           <Col sm={12}>
             <HTML value={prompt} />
           </Col>
         </Row>
         )}
        <Row className="mt-2">
          <Col>
            <CodeTagVal value={value} />
          </Col>
          <Col>
            <Button
              disabled={disabled}
              onClick={(): void => setShowModal(true)}
            >
              Choose line
            </Button>
            <FileModal
              disabled={disabled}
              references={choices}
              show={showModal}
              onClose={(): void => setShowModal(false)}
              onSave={(newState): void => {
                setShowModal(false);
                onChange(newState);
              }}
              startValue={value}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default CodeTag;
