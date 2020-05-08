import React from 'react';
import { ExamMessage } from '@hourglass/types';
import { DateTime } from 'luxon';

interface ExamMessagesProps {
  messages: ExamMessage[];
}

const ExamMessages: React.FC<ExamMessagesProps> = (props) => {
  const {
    messages,
  } = props;
  if (messages.length === 0) {
    return (
      <i>No messages.</i>
    );
  }
  return (
    <ul className="p-0">
      {messages.map((msg) => (
        <li key={msg.id}>
          <p className="m-0">{msg.time.toLocaleString(DateTime.TIME_SIMPLE)}</p>
          {msg.personal && (<p className="m-0"><i>(directly to you)</i></p>)}
          <p className="m-0">{msg.body}</p>
        </li>
      ))}
    </ul>
  );
};

export default ExamMessages;
