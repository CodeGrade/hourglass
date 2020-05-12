import React, { useState, useContext } from 'react';
import {
  Form,
  Button,
  Spinner,
} from 'react-bootstrap';
import {
  ProfQuestion,
  ProfQuestionStatus,
} from '@hourglass/types';
import { RailsContext } from '@hourglass/context';
import { DateTime } from 'luxon';
import { ExhaustiveSwitchError } from '@hourglass/helpers';
import { MdCloudDone, MdError } from 'react-icons/md';

interface ShowStatusProps {
  status: ProfQuestionStatus;
}

const ShowStatus: React.FC<ShowStatusProps> = (props) => {
  const {
    status,
  } = props;
  const size = '1.5em';
  switch (status) {
    case 'SENDING':
      return (
        <span className="text-info">
          <Spinner
            title="Sending question..."
            size="sm"
            animation="border"
          />
        </span>
      );
    case 'FAILED':
      return (
        <span className="text-danger">
          <MdError
            title="Failed sending question."
            size={size}
          />
        </span>
      );
    case 'SENT':
      return (
        <span
          className="text-success"
          title="Question sent successfully."
        >
          <MdCloudDone
            size={size}
          />
        </span>
      );
    default:
      throw new ExhaustiveSwitchError(status);
  }
};

interface ShowQuestionProps {
  question: ProfQuestion;
}

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    question,
  } = props;
  return (
    <>
      <div>
        <div className="mr-1 d-inline">
          <ShowStatus status={question.status} />
        </div>
        <i>{question.time.toLocaleString(DateTime.TIME_SIMPLE)}</i>
      </div>
      <p>{question.body}</p>
    </>
  );
};

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
  const valEmpty = val === '';
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
        disabled={anySending || valEmpty}
        onClick={(): void => {
          onSubmit(railsExam.id, val);
          setVal('');
        }}
      >
        {buttonText}
      </Button>
      <hr className="my-2" />
      <div>
        {questions.map((q) => (
          <div key={q.id}>
            <ShowQuestion
              question={q}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AskQuestion;
