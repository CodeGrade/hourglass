import React, { useState, useContext } from 'react';
import {
  Form,
  Button,
  Alert,
  AlertProps,
} from 'react-bootstrap';
import Routes from '@hourglass/routes';
import { getCSRFToken } from '@hourglass/helpers';
import { RailsContext } from '@hourglass/context';

async function submitQuestion(examID: number, question: string): Promise<boolean> {
  const url = Routes.ask_question_exam_path(examID);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        message: {
          body: question,
        },
      }),
    });
    const json = await (res.json() as Promise<{success: boolean}>);
    return json.success;
  } catch (e) {
    return false;
  }
}

const AskQuestion: React.FC<{}> = () => {
  const [val, setVal] = useState('');
  const [error, setError] = useState('');
  const [variant, setVariant] = useState<AlertProps['variant']>('danger');
  const [showAlert, setShowAlert] = useState(false);
  const [saving, setSaving] = useState(false);
  const buttonText = saving ? 'Saving...' : 'Submit';
  const { railsExam } = useContext(RailsContext);
  return (
    <>
      <Form.Control
        value={val}
        onChange={(event): void => {
          setVal(event.target.value);
        }}
        as="textarea"
        disabled={saving}
      />
      <Button
        className="mt-3"
        variant="success"
        disabled={saving}
        onClick={(): void => {
          setSaving(true);
          submitQuestion(railsExam.id, val).then(() => {
            setSaving(false);
            setVariant('success');
            setVal('');
            setError('Successfully submitted question.');
            setShowAlert(true);
          }).catch((e) => {
            setSaving(false);
            setVariant('danger');
            setError(e.message);
            setShowAlert(true);
          });
        }}
      >
        {buttonText}
      </Button>
      <Alert
        show={showAlert}
        variant={variant}
        dismissible
        onClose={(): void => setShowAlert(false)}
      >
        <Alert.Heading>Question</Alert.Heading>
        <p>{error}</p>
      </Alert>
    </>
  );
};

export default AskQuestion;
