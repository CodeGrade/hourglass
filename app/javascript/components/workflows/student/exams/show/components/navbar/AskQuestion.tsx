import React, { useState, useContext } from 'react';
import {
  Form,
  Button,
} from 'react-bootstrap';
import {
  ProfQuestion,
  ProfQuestionStatus,
} from '@student/exams/show/types';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { IconType } from 'react-icons';
import {
  MdCloudDone,
  MdError,
} from 'react-icons/md';
import {
  AiOutlineLoading,
} from 'react-icons/ai';
import { ShowMessage } from '@student/exams/show/components/navbar/ExamMessages';

const statusIcon = (status: ProfQuestionStatus): IconType => {
  switch (status) {
    case 'SENDING': return AiOutlineLoading;
    case 'FAILED': return MdError;
    case 'SENT': return MdCloudDone;
    default: throw new ExhaustiveSwitchError(status);
  }
};

const iconClass = (status: ProfQuestionStatus): string => {
  switch (status) {
    case 'SENDING': return 'text-info';
    case 'FAILED': return 'text-danger';
    case 'SENT': return 'text-success';
    default: throw new ExhaustiveSwitchError(status);
  }
};

const tooltipMessage = (status: ProfQuestionStatus): string => {
  switch (status) {
    case 'SENDING': return 'Sending question...';
    case 'FAILED': return 'Failed to send question.';
    case 'SENT': return 'Question sent successfully';
    default: throw new ExhaustiveSwitchError(status);
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
    <ShowMessage
      icon={statusIcon(question.status)}
      iconClass={iconClass(question.status)}
      tooltip={tooltipMessage(question.status)}
      time={question.time}
      body={question.body}
    />
  );
};

interface AskQuestionProps {
  disabled?: boolean;
  questions: ProfQuestion[];
  onSubmit: (body: string) => void;
}

const AskQuestion: React.FC<AskQuestionProps> = (props) => {
  const {
    disabled = false,
    questions,
    onSubmit,
  } = props;

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
        disabled={anySending || disabled}
      />
      <Button
        className="ml-auto mt-3 float-right"
        variant="success"
        disabled={anySending || valEmpty || disabled}
        onClick={(): void => {
          onSubmit(val);
          setVal('');
        }}
      >
        {buttonText}
      </Button>
      <span className="clearfix" />
      <hr className="my-2" />
      {questions.length === 0 && (
        <i>No questions sent.</i>
      )}
      <ul className="p-0">
        {questions.map((q) => (
          <ShowQuestion
            key={q.id}
            question={q}
          />
        ))}
      </ul>
    </div>
  );
};

export default AskQuestion;
