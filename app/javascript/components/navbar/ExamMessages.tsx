import React from 'react';
import { ExamMessage } from '@hourglass/types';
import { Button, Media } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { IconType } from 'react-icons';
import { MdFeedback, MdMessage } from 'react-icons/md';
import { GiBugleCall } from 'react-icons/gi';
import Tooltip from '@hourglass/components/Tooltip';
import Icon from '@hourglass/components/Icon';
import { NavAccordionItem } from '@hourglass/components/navbar/ExamNavbar';

interface ExamMessagesProps {
  expanded: boolean;
  messages: ExamMessage[];
  onMessagesOpened: () => void;
  unread: boolean;
  onSectionClick: (eventKey: string) => void;
}

export interface MessageProps {
  icon: IconType;
  iconClass?: string;
  tooltip: string;
  time: DateTime;
  body: React.ReactElement | string;
}

export const ShowMessage: React.FC<MessageProps> = (props) => {
  const {
    icon,
    iconClass,
    tooltip,
    time,
    body,
  } = props;
  return (
    <Media as="li">
      <span className="mr-2">
        <Tooltip message={tooltip}><Icon I={icon} className={iconClass} /></Tooltip>
      </span>
      <Media.Body>
        <p className="m-0"><i className="text-muted">{`(sent ${time.toLocaleString(DateTime.TIME_SIMPLE)})`}</i></p>
        <p>{body}</p>
      </Media.Body>
    </Media>
  );
};

const ExamMessages: React.FC<ExamMessagesProps> = (props) => {
  const {
    expanded,
    messages,
    onMessagesOpened,
    unread,
    onSectionClick,
  } = props;
  const msgs = messages.map((msg) => (
    <ShowMessage
      key={msg.id}
      body={msg.body}
      icon={msg.personal ? MdMessage : GiBugleCall}
      tooltip={msg.personal ? 'Sent only to you' : 'Announcement'}
      time={msg.time}
    />
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
          className="float-right"
          onClick={(): void => onMessagesOpened()}
        >
          Acknowledge unread messages
        </Button>
      )}
    </NavAccordionItem>
  );
};

export default ExamMessages;
