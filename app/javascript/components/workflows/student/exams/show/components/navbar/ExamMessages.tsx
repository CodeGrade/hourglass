import React from 'react';
import { ExamMessage } from '@student/exams/show/types';
import { Button, Media } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { IconType } from 'react-icons';
import { MdFeedback, MdMessage } from 'react-icons/md';
import { GiBugleCall } from 'react-icons/gi';
import Tooltip from '@student/exams/show/components/Tooltip';
import Icon from '@student/exams/show/components/Icon';
import NavAccordionItem from '@student/exams/show/components/navbar/NavAccordionItem';

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

const ShowMessageTooltip: React.FC<{
  icon: IconType;
  iconClass?: string;
  tooltip: string;
}> = (props) => {
  const { tooltip, icon, iconClass } = props;
  return (
    <span className="mr-2">
      <Tooltip message={tooltip}><Icon I={icon} className={iconClass} /></Tooltip>
    </span>
  );
};

export const ShowMessage: React.FC<MessageProps> = React.memo((props) => {
  const {
    icon,
    iconClass,
    tooltip,
    time,
    body,
  } = props;
  return (
    <Media as="li">
      <ShowMessageTooltip tooltip={tooltip} icon={icon} iconClass={iconClass} />
      <Media.Body>
        <p className="m-0"><i className="text-muted">{`(sent ${time.toLocaleString(DateTime.TIME_SIMPLE)})`}</i></p>
        <p>{body}</p>
      </Media.Body>
    </Media>
  );
}, (prev, next) => (
  prev.icon === next.icon
    && prev.iconClass === next.iconClass
    && prev.tooltip === next.tooltip
    && prev.body === next.body
    && prev.time.equals(next.time)
));

const noMessages = <i>No messages.</i>;

const ExamMessages: React.FC<ExamMessagesProps> = React.memo((props) => {
  const {
    expanded,
    messages,
    onMessagesOpened,
    unread,
    onSectionClick,
  } = props;
  const msgs = messages.map((msg) => (
    <ShowMessage
      key={`${msg.type}${msg.id}`}
      body={msg.body}
      icon={msg.type === 'personal' ? MdMessage : GiBugleCall}
      tooltip={msg.type === 'personal' ? 'Sent only to you' : 'Announcement'}
      time={msg.time}
    />
  ));
  const body = msgs.length === 0
    ? noMessages
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
          onClick={onMessagesOpened}
        >
          Acknowledge unread messages
        </Button>
      )}
    </NavAccordionItem>
  );
}, (prev, next) => {
  const same = prev.unread === next.unread
    && prev.messages.length === next.messages.length
    && prev.messages.reduce((acc, current, idx) => {
      const currentEqual = current === next.messages[idx];
      return acc && currentEqual;
    }, true)
    && prev.expanded === next.expanded
    && prev.onMessagesOpened === next.onMessagesOpened
    && prev.onSectionClick === next.onSectionClick;
  console.log('ExamMessages same: ', same, prev, next);
  return same;
});

export default ExamMessages;
