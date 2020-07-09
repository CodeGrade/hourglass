import React, { useState, useMemo } from 'react';
import { ExamMessage } from '@student/exams/show/types';
import { Media } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { IconType } from 'react-icons';
import { MdFeedback, MdMessage } from 'react-icons/md';
import { GiBugleCall } from 'react-icons/gi';
import Tooltip from '@student/exams/show/components/Tooltip';
import Icon from '@student/exams/show/components/Icon';
import NavAccordionItem from '@student/exams/show/components/navbar/NavAccordionItem';
import { NewMessages, PreviousMessages } from '@hourglass/common/messages';
import { useFragment, graphql, useSubscription } from 'relay-hooks';
import { ExamMessages_all$key } from './__generated__/ExamMessages_all.graphql';
import { ExamMessages_navbar$key } from './__generated__/ExamMessages_navbar.graphql';

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

const newMessageSubscriptionSpec = graphql`
  subscription ExamMessagesSubscription($examId: ID!) {
    messageWasSent(examId: $examId) {
      ...ExamMessages_all
    }
  }
`;

export const ShowExamMessages: React.FC<{
  examKey: ExamMessages_all$key;
  lastViewed: DateTime;
  onMessagesOpened: () => void;
}> = (props) => {
  const {
    examKey,
    lastViewed,
    onMessagesOpened,
  } = props;
  const res = useFragment(
    graphql`
    fragment ExamMessages_all on Exam {
      id
      examAnnouncements {
        id
        createdAt
        body
      }
      myRegistration {
        room {
          roomAnnouncements {
            id
            createdAt
            body
          }
        }
        examVersion {
          versionAnnouncements {
            id
            createdAt
            body
          }
        }
        messages {
          edges {
            node {
              id
              createdAt
              body
            }
          }
        }
      }
    }
    `,
    examKey,
  );
  const subscriptionObject = useMemo(() => ({
    subscription: newMessageSubscriptionSpec,
    variables: {
      examId: res.id,
    },
  }), [res.id]);
  useSubscription(subscriptionObject);

  const personal: ExamMessage[] = res.myRegistration.messages.edges.map(({ node }) => ({
    type: 'personal',
    id: node.id,
    body: node.body,
    createdAt: DateTime.fromISO(node.createdAt),
  }));
  const room: ExamMessage[] = res.myRegistration.room?.roomAnnouncements.map((ra) => ({
    type: 'room',
    id: ra.id,
    body: ra.body,
    createdAt: DateTime.fromISO(ra.createdAt),
  })) ?? [];
  const version: ExamMessage[] = res.myRegistration.examVersion.versionAnnouncements.map((va) => ({
    type: 'version',
    id: va.id,
    body: va.body,
    createdAt: DateTime.fromISO(va.createdAt),
  }));
  const exam: ExamMessage[] = res.examAnnouncements.map((ea) => ({
    type: 'exam',
    id: ea.id,
    body: ea.body,
    createdAt: DateTime.fromISO(ea.createdAt),
  }));

  const all: Array<ExamMessage> = personal
    .concat(exam)
    .concat(version)
    .concat(room);
  all.sort((a, b) => b.createdAt.diff(a.createdAt).milliseconds);
  const idx = all.findIndex((msg) => msg.createdAt < lastViewed);
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
              time={msg.createdAt}
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
          time={msg.createdAt}
        />
      ))}
    </>
  );
};

interface ExamMessagesProps {
  examKey: ExamMessages_navbar$key;
  expanded: boolean;
  onSectionClick: (eventKey: string) => void;
}

const ExamMessages: React.FC<ExamMessagesProps> = (props) => {
  const {
    examKey,
    expanded,
    onSectionClick,
  } = props;
  const [lastViewed, setLastViewed] = useState(DateTime.fromSeconds(0));
  const res = useFragment(
    graphql`
    fragment ExamMessages_navbar on Exam {
      ...ExamMessages_all
      examAnnouncements {
        createdAt
      }
      myRegistration {
        room {
          roomAnnouncements {
            createdAt
          }
        }
        examVersion {
          versionAnnouncements {
            createdAt
          }
        }
        messages {
          edges {
            node {
              createdAt
            }
          }
        }
      }
    }
    `,
    examKey,
  );
  const dates: DateTime[] = res
    .examAnnouncements.map(({ createdAt }) => DateTime.fromISO(createdAt))
    .concat(
      res.myRegistration.room?.roomAnnouncements.map(
        ({ createdAt }) => DateTime.fromISO(createdAt),
      ) ?? [],
    )
    .concat(
      res.myRegistration.examVersion.versionAnnouncements.map(
        ({ createdAt }) => DateTime.fromISO(createdAt),
      ),
    )
    .concat(res.myRegistration.messages.edges.map(({ node }) => DateTime.fromISO(node.createdAt)));

  const anyUnread: boolean = dates.reduce((acc, date) => (acc || date > lastViewed), false);
  const classes = anyUnread ? 'bg-warning text-dark' : undefined;

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
        examKey={res}
        lastViewed={lastViewed}
        onMessagesOpened={() => {
          setLastViewed(DateTime.local());
        }}
      />
    </NavAccordionItem>
  );
};

export default ExamMessages;
