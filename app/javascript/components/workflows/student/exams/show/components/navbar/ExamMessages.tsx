import React from 'react';
import { ExamMessage, AllExamMessages } from '@student/exams/show/types';
import { Media } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { IconType } from 'react-icons';
import { MdFeedback, MdMessage } from 'react-icons/md';
import { GiBugleCall } from 'react-icons/gi';
import Tooltip from '@student/exams/show/components/Tooltip';
import Icon from '@student/exams/show/components/Icon';
import NavAccordionItem from '@student/exams/show/components/navbar/NavAccordionItem';
import { NewMessages, PreviousMessages } from '@hourglass/common/messages';

interface ExamMessagesProps {
  lastViewed: DateTime;
  expanded: boolean;
  messages: AllExamMessages;
  onMessagesOpened: () => void;
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
        <Tooltip message={tooltip}>
          <div>
            <Icon I={icon} className={iconClass} />
          </div>
        </Tooltip>
      </span>
      <Media.Body>
        <p className="m-0"><i className="text-muted">{`(sent ${time.toLocaleString(DateTime.TIME_SIMPLE)})`}</i></p>
        <p>{body}</p>
      </Media.Body>
    </Media>
  );
};

export const ShowExamMessages: React.FC<{
  lastViewed: DateTime;
  messages: AllExamMessages;
  onMessagesOpened: () => void;
}> = (props) => {
  const {
    lastViewed,
    messages,
    onMessagesOpened,
  } = props;
  const {
    personal,
    exam,
    version,
    room,
  } = messages;
  const all: Array<ExamMessage> = personal
    .concat(exam)
    .concat(version)
    .concat(room);
  all.sort((a, b) => b.time.diff(a.time).milliseconds);
  const idx = all.findIndex((msg) => msg.time < lastViewed);
  const earlier = idx === -1 ? [] : all.slice(idx);
  const later = idx === -1 ? all : all.slice(0, idx);
  const dividerClass = later.length === 0 ? 'd-none' : '';

  if (all.length === 0) {
    return <i>No messages.</i>;
  }

  return (
    <>
      <div className={dividerClass}>
        <NewMessages onClick={onMessagesOpened} />
        {later.map((msg) => (
          <div
            className="new-message"
            key={`${msg.type}${msg.id}`}
          >
            <ShowMessage
              body={msg.body}
              icon={msg.type === 'personal' ? MdMessage : GiBugleCall}
              tooltip={msg.type === 'personal' ? 'Sent only to you' : 'Announcement'}
              time={msg.time}
            />
          </div>
        ))}
        {earlier.length > 0 && <PreviousMessages />}
      </div>
      {earlier.map((msg) => (
        <ShowMessage
          key={`${msg.type}${msg.id}`}
          body={msg.body}
          icon={msg.type === 'personal' ? MdMessage : GiBugleCall}
          tooltip={msg.type === 'personal' ? 'Sent only to you' : 'Announcement'}
          time={msg.time}
        />
      ))}
    </>
  );
};

const ExamMessages: React.FC<ExamMessagesProps> = (props) => {
  const {
    lastViewed,
    expanded,
    messages,
    onMessagesOpened,
    onSectionClick,
  } = props;
  const unread: boolean = Object.values(messages).reduce((acc, msgs: ExamMessage[]) => (
    acc || msgs.reduce((innerAcc, msg) => (innerAcc || msg.time > lastViewed), false)
  ), false);
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
      <ShowExamMessages
        lastViewed={lastViewed}
        messages={messages}
        onMessagesOpened={onMessagesOpened}
      />
    </NavAccordionItem>
  );
};

export default ExamMessages;
