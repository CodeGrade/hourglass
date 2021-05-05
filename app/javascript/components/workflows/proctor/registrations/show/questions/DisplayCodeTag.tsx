import React, { useState, useContext } from 'react';
import { FileRef, CodeTagInfo, CodeTagState } from '@student/exams/show/types';
import {
  Row, Col, Modal, Button,
} from 'react-bootstrap';
import { ControlledFileViewer } from '@student/exams/show/components/FileViewer';
import { CodeTagVal } from '@student/exams/show/components/questions/CodeTag';
import {
  ExamFilesContext,
  QuestionFilesContext,
  PartFilesContext,
  ExamContext,
} from '@hourglass/common/context';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { getFilesForRefs, countFiles } from '@student/exams/show/files';

interface FileModalProps {
  references: readonly FileRef[];
  value: CodeTagState;
  show: boolean;
  onClose: () => void;
}

const FileModal: React.FC<FileModalProps> = (props) => {
  const {
    show,
    references,
    value,
    onClose,
  } = props;
  const { fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, references);
  const [refresher, setRefresher] = useState(false);
  const refreshCodeMirror = (): void => setRefresher((b) => !b);
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
      <Modal.Body>
        <ControlledFileViewer
          refreshProps={[refresher]}
          references={references}
          selection={value}
          onChangeFile={(_newFile): void => {
            // do nothing
          }}
          onChangeLine={(_newLine): void => {
            refreshCodeMirror();
          }}
        />
      </Modal.Body>
      <Modal.Footer className="align-items-baseline">
        <div className="mr-auto">
          <CodeTagVal
            value={value}
            filteredFiles={filteredFiles}
            hideFile={countFiles(filteredFiles) === 1}
          />
        </div>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

interface CodeTagProps {
  info: CodeTagInfo;
  value: CodeTagState;
}

const DisplayCodeTag: React.FC<CodeTagProps> = (props) => {
  const {
    info,
    value,
  } = props;
  const { choices } = info;
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
  if (value) {
    return (
      <Row className="mt-2 align-items-baseline">
        <Col>
          <CodeTagVal
            value={value}
            filteredFiles={filteredFiles}
            hideFile={countFiles(filteredFiles) === 1}
          />
        </Col>
        <Col>
          <Button size="sm" onClick={(): void => setShowModal(true)} variant="outline-info">
            Show line
          </Button>
          <FileModal
            references={references}
            show={showModal}
            onClose={(): void => setShowModal(false)}
            value={value}
          />
        </Col>
      </Row>
    );
  }
  return (
    <Row className="mt-2">
      <Col>
        <b>File: </b>
        <i>No file selected</i>
      </Col>
    </Row>
  );
};

export default DisplayCodeTag;
