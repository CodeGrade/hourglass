import React, { useState } from 'react';
import { FileRef, CodeTag, CodeTagState } from '../../types';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import { FileViewer } from '../FileViewer';
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
  const [selected, setSelected] = useState(startValue);
  const { selectedFile, marks } = selected;
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
        wait
        {/*<FileViewer
          controlled
          references={references}
          selection={selectedFile}
          onSelectionChange={setSelected}
        />*/}
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
      <Button
        onClick={() => setShowModal(true)}
      >
        Choose line
      </Button>
      <FileModal
        references={choices}
        show={showModal}
        onClose={()=>setShowModal(false)}
        onSave={(selectedMarks)=> {
          setShowModal(false);
          onChange(selectedMarks);
        }}
        startValue={value ?? {}}
      />
    </div>
  );
}
