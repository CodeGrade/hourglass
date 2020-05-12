import React, { useState, useContext } from 'react';
import {
  Form,
  Button,
} from 'react-bootstrap';
import { ProfQuestion } from '@hourglass/types';
import { RailsContext } from '@hourglass/context';
import { DateTime } from 'luxon';

interface AskQuestionProps {
  questions: ProfQuestion[];
  onSubmit: (examID: number, body: string) => void;
}

const AskQuestion: React.FC<AskQuestionProps> = (props) => {
  const {
    questions,
    onSubmit,
  } = props;
  const {
    railsExam,
  } = useContext(RailsContext);

  const anySending = questions.some((q) => q.status === 'SENDING');

  const [val, setVal] = useState('');
  const buttonText = anySending ? 'Saving...' : 'Submit';
  return (
    <div>
      <Form.Control
        value={val}
        onChange={(event): void => {
          setVal(event.target.value);
        }}
        as="textarea"
        disabled={anySending}
      />
      <Button
        className="ml-auto mt-3"
        variant="success"
        disabled={anySending}
        onClick={(): void => {
          onSubmit(railsExam.id, val);
          setVal('');
        }}
      >
        {buttonText}
      </Button>
      <ul>
        {questions.map((q) => (
          <li key={q.id}>
            <i>{q.time.toLocaleString(DateTime.TIME_SIMPLE)}</i>
            <p>{q.body}</p>
            <p>{q.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AskQuestion;
