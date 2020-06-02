import React, { useState } from 'react';
import { FileRef, CodeTagInfo, CodeTagState } from '@student/exams/show/types';
import {
  Row, Col, Modal, Button,
} from 'react-bootstrap';
import { ControlledFileViewer } from '@student/exams/show/components/FileViewer';
import HTML from '@student/exams/show/components/HTML';
import { CodeTagVal } from '@student/exams/show/components/questions/CodeTag';


interface FileModalProps {
  references: FileRef[];
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
      <Modal.Footer>
        <div className="mr-auto">
          <CodeTagVal value={value} />
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
  const { choices, prompt } = info;
  const [showModal, setShowModal] = useState(false);
  let theRest;
  if (value) {
    theRest = (
      <>
        <Row className="mt-2">
          <Col>
            <CodeTagVal value={value} />
          </Col>
          <Col>
            <Button size="sm" onClick={(): void => setShowModal(true)} variant="outline-info">
              Show line
            </Button>
            <FileModal
              references={choices}
              show={showModal}
              onClose={(): void => setShowModal(false)}
              value={value}
            />
          </Col>
        </Row>
      </>
    );
  } else {
    theRest = (
      <Row className="mt-2">
        <Col>
          <b>File: </b>
          <i>No file selected</i>
        </Col>
      </Row>
    );
  }
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
        {theRest}
      </Col>
    </Row>
  );
};

export default DisplayCodeTag;
