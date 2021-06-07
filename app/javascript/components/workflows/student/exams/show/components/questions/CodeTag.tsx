import React, { useEffect, useState, useContext } from 'react';
import {
  FileRef,
  CodeTagInfo,
  CodeTagState,
  ExamFile,
} from '@student/exams/show/types';
import {
  Row, Col, Modal, Button,
} from 'react-bootstrap';
import { ControlledFileViewer } from '@student/exams/show/components/FileViewer';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import HTML from '@student/exams/show/components/HTML';
import { ExhaustiveSwitchError, useRefresher } from '@hourglass/common/helpers';
import { getFilesForRefs, countFiles } from '@student/exams/show/files';
import {
  ExamContext,
  ExamFilesContext,
  QuestionFilesContext,
  PartFilesContext,
} from '@hourglass/common/context';

interface CodeTagValProps {
  value: CodeTagState;
  hideFile?: boolean;
  filteredFiles: ExamFile[];
}

const CodeTagVal: React.FC<CodeTagValProps> = (props) => {
  const { value, hideFile = false, filteredFiles } = props;
  const root = filteredFiles.find((f) => value?.selectedFile?.startsWith(f.relPath));
  let display = value?.selectedFile;
  if (display && root) {
    if (root.text.endsWith('/')) {
      display = display.replace(`${root.relPath}/`, root.text);
    } else {
      display = display.replace(root.relPath, root.text);
    }
  }
  if (display?.startsWith('/')) display = display.substring(1);
  return (
    <div>
      {hideFile || (
        <span className="mr-2">
          <b className="mr-2">File:</b>
          {value?.selectedFile
            ? (
              <Button disabled size="sm" variant="outline-dark">
                {display}
              </Button>
          )
            : <i>Unanswered</i>}
        </span>
      )}
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
  references: readonly FileRef[];
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
  const { fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, references);
  // Modal has its own state so the user can manipulate it before saving.
  const [selected, setSelected] = useState(startValue);
  const [refresher, refreshCodeMirror] = useRefresher();
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
            // This might occur when there's only one file visible,
            // and so ControlledFileViewer triggers an onChangeFile
            // as a preemptive measure.
            if (newFile === selected?.selectedFile) { return; }
            setSelected({
              selectedFile: newFile,
              lineNumber: undefined,
            });
          }}
          onChangeLine={(newLine): void => {
            setSelected((old) => ({
              ...old,
              lineNumber: newLine,
            }));
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <div className="mr-auto">
          <CodeTagVal
            value={selected}
            filteredFiles={filteredFiles}
            hideFile={countFiles(filteredFiles) === 1}
          />
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
  const examReferences = useContext(ExamFilesContext);
  const questionReferences = useContext(QuestionFilesContext);
  const partReferences = useContext(PartFilesContext);
  let references: readonly FileRef[];
  switch (choices) {
    case 'exam':
      references = examReferences.references;
      break;
    case 'question':
      references = questionReferences.references;
      break;
    case 'part':
      references = partReferences.references;
      break;
    default:
      throw new ExhaustiveSwitchError(choices);
  }
  const { fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, references);
  return (
    <Row>
      <Col>
        <HTML value={prompt} />
        <Row className="mt-2 align-items-baseline">
          <Col>
            <CodeTagVal
              value={value}
              hideFile={countFiles(filteredFiles) === 1}
              filteredFiles={filteredFiles}
            />
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
              references={references}
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
