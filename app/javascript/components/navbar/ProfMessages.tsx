import React from 'react';
import { ProfMessage } from '@hourglass/types';

interface ProfMessagesProps {
  messages: ProfMessage[];
}

const ProfMessages: React.FC<ProfMessagesProps> = (props) => {
  const {
    messages,
  } = props;
  if (messages.length === 0) {
    return (
      <i>No messages.</i>
    );
  }
  return (
    <ul>
      {messages.map((msg) => (
        <li>
          <p className="m-0"><b>{msg.title}</b></p>
          {msg.personal && (<p className="m-0"><i>(directly to you)</i></p>)}
          {msg.body && (<p className="m-0">{msg.body}</p>)}
        </li>
      ))}
    </ul>
  );
};

export default ProfMessages;
