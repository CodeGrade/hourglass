import React from 'react';
import { ExamMessage } from '@hourglass/types';
import { Button } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { MdFeedback } from 'react-icons/md';
import { NavAccordionItem } from '@hourglass/components/navbar/ExamNavbar';

interface ExamMessagesProps {
  expanded: boolean;
  messages: ExamMessage[];
  onMessagesOpened: () => void;
  unread: boolean;
  onSectionClick: (eventKey: string) => void;
}

const ExamMessages: React.FC<ExamMessagesProps> = (props) => {
  const {
    expanded,
    messages,
    onMessagesOpened,
    unread,
    onSectionClick,
  } = props;
  const msgs = messages.map((msg) => (
    <li key={msg.id}>
      <p className="m-0">{msg.time.toLocaleString(DateTime.TIME_SIMPLE)}</p>
      {msg.personal && (<p className="m-0"><i>(directly to you)</i></p>)}
      <p className="m-0">{msg.body}</p>
    </li>
  ));
  const body = msgs.length === 0
    ? <i>No messages.</i>
    : msgs;
  const classes = unread ? 'bg-warning text-dark' : undefined;
  return (
    <NavAccordionItem
      expanded={expanded}
      Icon={MdFeedback}
      label="Professor messages"
      className={classes}
      eventKey="profmsg"
      onSectionClick={onSectionClick}
    >
      <ul className="p-0">
        {body}
      </ul>
      {unread && (
        <Button
          variant="success"
          onClick={(): void => onMessagesOpened()}
        >
          Acknowledge unread messages
        </Button>
      )}
    </NavAccordionItem>
  );
};

export default ExamMessages;
