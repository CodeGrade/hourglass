import React, { useState, useContext } from 'react';
import {
  Form,
  Button,
} from 'react-bootstrap';
import {
  ProfQuestion,
  ProfQuestionStatus,
} from '@hourglass/types';
import { RailsContext } from '@hourglass/context';
import { DateTime } from 'luxon';
import { ExhaustiveSwitchError } from '@hourglass/helpers';
import { MdCloudDone, MdError } from 'react-icons/md';
import { ICON_SIZE } from '@hourglass/constants';
import TooltipButton from '@hourglass/components/TooltipButton';

interface ShowStatusProps {
  status: ProfQuestionStatus;
}

const ShowStatus: React.FC<ShowStatusProps> = (props) => {
  const {
    status,
  } = props;
  switch (status) {
    case 'SENDING':
      return (
        <TooltipButton
          variant="info"
          disabled
          disabledMessage="Sending question..."
        >
          <span
            className="spinner-border align-middle"
            style={{ width: ICON_SIZE, height: ICON_SIZE }}
            role="status"
          />
        </TooltipButton>
      );
    case 'FAILED':
      return (
        <TooltipButton
          variant="danger"
          disabled
          disabledMessage="Failed sending question."
        >
          <MdError
            size={ICON_SIZE}
            role="status"
          />
        </TooltipButton>
      );
    case 'SENT':
      return (
        <TooltipButton
          variant="success"
          disabled
          disabledMessage="Question sent successfully."
        >
          <MdCloudDone
            size={ICON_SIZE}
            role="status"
          />
        </TooltipButton>
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
        <i className="text-muted">{`(sent ${question.time.toLocaleString(DateTime.TIME_SIMPLE)})`}</i>
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
        className="ml-auto mt-3 float-right"
        variant="success"
        disabled={anySending || valEmpty}
        onClick={(): void => {
          onSubmit(railsExam.id, val);
          setVal('');
        }}
      >
        {buttonText}
      </Button>
      <span className="clearfix" />
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
