import React, { useState } from 'react';
import {
  Button,
  Modal,
} from 'react-bootstrap';

interface SubmitButtonProps {
  submit: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const { submit } = props;
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="my-2">
      <Modal
        centered
        keyboard
        show={submitting}
        onHide={() => { setSubmitting(false); }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Are you sure you want to submit?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Once you submit, you will no be able to change your answers,
          or see your submission until it has been graded.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => {
              setSubmitting(false);
              submit();
            }}
          >
            Submit Exam
          </Button>
          <Button
            variant="danger"
            onClick={() => { setSubmitting(false); }}
          >
            Continue working
          </Button>
        </Modal.Footer>
      </Modal>
      <Button
        variant="success"
        onClick={() => { setSubmitting(true); }}
      >
        Submit Exam
      </Button>
    </div>
  );
};

export default SubmitButton;
