import React, { useEffect, useState } from 'react';
import { FileRef, CodeTag, CodeTagState } from '../../types';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import { ControlledFileViewer } from '../FileViewer';
import { HTML } from './HTML';

interface CodeTagValProps {
  value: CodeTagState;
}

function CodeTagVal(props: CodeTagValProps) {
  const { value } = props;
  return (
    <div>
      <p>
        <b className="mr-2">File:</b>
        {value?.selectedFile
        ? (
          <Button disabled size="sm" variant="outline-dark">
            {value.selectedFile}
          </Button>
        )
        : <i>Unanswered</i>
        }
      </p>
      <p>
        <b className="mr-2">Line:</b>
        {value?.lineNumber
        ? (
          <Button disabled size="sm" variant="outline-dark">
            {value.lineNumber}
          </Button>
        )
        : <i>Unanswered</i>
        }
      </p>
    </div>
  );
}

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
  const refreshCodeMirror = () => {
    setTimeout(() => {
      // flip the state back and forth to refresh CodeMirror
      const old = selected;
      setSelected({});
      setSelected(old);
    });
  }
  const saveEnabled = selected?.selectedFile && selected?.lineNumber;
  return (
    <Modal
      show={show}
      onHide={onClose}
      onEntering={refreshCodeMirror}
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
      </Modal.Body>
      <Modal.Footer>
        <div className="mr-auto">
          <CodeTagVal value={selected} />
        </div>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => onSave(selected)}
          disabled={!saveEnabled}
        >
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
    <Row>
      <Col>
        {prompt &&
         <Row>
           <Col sm={12}>
             {prompt.map((p, i) => <HTML key={i} value={p} />)}
           </Col>
         </Row>
        }
        <CodeTagVal value={value} />
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
      </Col>
    </Row>
  );
}
