import React, { useEffect, useState } from 'react';
import { FileRef, CodeTag, CodeTagState } from '../../types';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import { ControlledFileViewer } from '../FileViewer';
import { HTML } from './HTML';

interface FileModalProps {
  references: Array<FileRef>;
  show: boolean;
  onClose: () => void;
  onSave: (newState: CodeTagState) => void;
  startValue: CodeTagState;
}

function FileModal(props) {
  const { show, onClose, onSave, references, startValue } = props;
  // Modal has its own state so the user can manipulate it before saving.
  const [selected, setSelected] = useState(startValue);
  useEffect(() => {
    // Reset my starting state when outer state changes.
    setSelected(startValue);
  }, [startValue]);
  return (
    <Modal
      show={show}
      onHide={onClose}
      dialogClassName="w-100 mw-100 m-2"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Choose a line</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ControlledFileViewer
          references={references}
          selection={selected}
          onChangeFile={(newFile) => {
            setSelected(old => ({
              ...old,
              selectedFile: newFile,
            }));
          }}
          onChangeLine={(newLine) => {
            setSelected(old => ({
              ...old,
              lineNumber: newLine,
            }));
          }}
        />
        <div>
          <p>
            <b>Selected file:</b>
            <span>{selected?.selectedFile || "none"}</span>
          </p>
          <p>
            <b>Selected line number:</b>
            <span>{selected?.lineNumber || "none"}</span>
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={() => onSave(selected)}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

interface CodeTagProps {
  info: CodeTag;
  value: CodeTagState;
  onChange: (newVal: CodeTagState) => void;
}

export function CodeTag(props: CodeTagProps) {
  const { info, value, onChange } = props;
  const { choices, prompt } = info;
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      {prompt &&
       <Row>
         <Col sm={12}>
           {prompt.map((p, i) => <HTML key={i} value={p} />)}
         </Col>
       </Row>
      }
      <p>
        <b>Selected file:</b>
        <span>{value?.selectedFile || "none"}</span>
      </p>
      <p>
        <b>Selected line number:</b>
        <span>{value?.lineNumber || "none"}</span>
      </p>
      <Button
        onClick={() => setShowModal(true)}
      >
        Choose line
      </Button>
      <FileModal
        references={choices}
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={(newState) => {
          setShowModal(false);
          onChange(newState);
        }}
        startValue={value}
      />
    </div>
  );
}
