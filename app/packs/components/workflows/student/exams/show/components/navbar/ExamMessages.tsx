import React, { useState, useMemo, useEffect } from 'react';
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
import {
  useFragment,
  graphql,
  useSubscription,
  useRelayEnvironment,
} from 'relay-hooks';
import { GraphQLSubscriptionConfig, requestSubscription, OperationType } from 'relay-runtime';

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
        <p className="wrap-anywhere">{body}</p>
      </Media.Body>
    </Media>
  );
};

const messageReceivedSubscriptionSpec = graphql`
  subscription ExamMessagesSubscription($registrationId: ID!) {
    messageReceived(registrationId: $registrationId) {
      message {
        id
        createdAt
        body
      }
      messagesEdge {
        node {
          id
        }
      }
    }
  }
`;

const newExamAnnouncementSubscriptionSpec = graphql`
  subscription ExamMessagesNewAnnouncementSubscription($examId: ID!) {
    examAnnouncementWasSent(examId: $examId) {
      examAnnouncement {
        id
        createdAt
        body
      }
      examAnnouncementsEdge {
        node {
          id
        }
      }
    }
  }
`;

const versionAnnouncementReceivedSpec = graphql`
  subscription ExamMessagesNewVersionAnnouncementSubscription($examVersionId: ID!) {
    versionAnnouncementReceived(examVersionId: $examVersionId) {
      versionAnnouncement {
        id
        createdAt
        body
      }
      versionAnnouncementsEdge {
        node {
          id
        }
      }
    }
  }
`;

const roomAnnouncementReceivedSpec = graphql`
  subscription ExamMessagesNewRoomAnnouncementSubscription($roomId: ID!) {
    roomAnnouncementReceived(roomId: $roomId) {
      roomAnnouncement {
        id
        createdAt
        body
      }
      roomAnnouncementsEdge {
        node {
          id
        }
      }
    }
  }
`;

function useConditionalSubscription<TSubscriptionPayload extends OperationType>(
  config: GraphQLSubscriptionConfig<TSubscriptionPayload>,
  condition: boolean,
): void {
  const environment = useRelayEnvironment();

  useEffect(() => {
    if (condition) {
      const { dispose } = requestSubscription(environment, config);
      return dispose;
    }
    return () => undefined;
  }, [condition, environment, config]);
}

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
      examAnnouncements(first: 100000) @connection(key: "ExamMessages_examAnnouncements", filters: []) {
        edges {
          node {
            id
            createdAt
            body
          }
        }
      }
      myRegistration {
        id
        room {
          id
          roomAnnouncements(first: 100000) @connection(key: "ExamMessages_roomAnnouncements", filters: []) {
            edges {
              node {
                id
                createdAt
                body
              }
            }
          }
        }
        examVersion {
          id
          versionAnnouncements(first: 100000) @connection(key: "ExamMessages_versionAnnouncements", filters: []) {
            edges {
              node {
                id
                createdAt
                body
              }
            }
          }
        }
        messages(first: 100000) @connection(key: "ExamMessages_messages", filters: []) {
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
  useSubscription(useMemo(() => ({
    subscription: messageReceivedSubscriptionSpec,
    variables: {
      registrationId: res.myRegistration.id,
    },
    configs: [{
      type: 'RANGE_ADD',
      parentID: res.myRegistration.id,
      connectionInfo: [{
        key: 'ExamMessages_messages',
        rangeBehavior: 'prepend',
      }],
      edgeName: 'messagesEdge',
    }],
  }), [res.id]));

  useSubscription(useMemo(() => ({
    subscription: newExamAnnouncementSubscriptionSpec,
    variables: {
      examId: res.id,
    },
    configs: [{
      type: 'RANGE_ADD',
      parentID: res.id,
      connectionInfo: [{
        key: 'ExamMessages_examAnnouncements',
        rangeBehavior: 'prepend',
      }],
      edgeName: 'examAnnouncementsEdge',
    }],
  }), [res.id]));

  useSubscription(useMemo(() => ({
    subscription: versionAnnouncementReceivedSpec,
    variables: {
      examVersionId: res.myRegistration.examVersion.id,
    },
    configs: [{
      type: 'RANGE_ADD',
      parentID: res.myRegistration.examVersion.id,
      connectionInfo: [{
        key: 'ExamMessages_versionAnnouncements',
        rangeBehavior: 'prepend',
      }],
      edgeName: 'versionAnnouncementsEdge',
    }],
  }), [res.myRegistration.examVersion.id]));

  useConditionalSubscription(
    useMemo(() => ({
      subscription: roomAnnouncementReceivedSpec,
      variables: {
        roomId: res.myRegistration.room?.id,
      },
      configs: [{
        type: 'RANGE_ADD',
        parentID: res.myRegistration.room?.id,
        connectionInfo: [{
          key: 'ExamMessages_roomAnnouncements',
          rangeBehavior: 'prepend',
        }],
        edgeName: 'roomAnnouncementsEdge',
      }],
    }), [res.myRegistration.room?.id]),
    !!res.myRegistration.room,
  );

  const personal: ExamMessage[] = res.myRegistration.messages.edges.map(({ node }) => ({
    type: 'personal',
    id: node.id,
    body: node.body,
    createdAt: DateTime.fromISO(node.createdAt),
  }));
  const room: ExamMessage[] = res.myRegistration.room?.roomAnnouncements.edges.map(
    ({ node: ra }) => ({
      type: 'room',
      id: ra.id,
      body: ra.body,
      createdAt: DateTime.fromISO(ra.createdAt),
    }),
  ) ?? [];
  const version: ExamMessage[] = res.myRegistration.examVersion.versionAnnouncements.edges.map(
    ({ node: va }) => ({
      type: 'version',
      id: va.id,
      body: va.body,
      createdAt: DateTime.fromISO(va.createdAt),
    }),
  );
  const exam: ExamMessage[] = res.examAnnouncements.edges.map(({ node: ea }) => ({
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

type NewMessageWarning = 'noWarning' | 'warningActivated' | 'warningDismissed';

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
      examAnnouncements(first: 100000) @connection(key: "ExamMessages_examAnnouncements", filters: []) {
        edges {
          node {
            createdAt
          }
        }
      }
      myRegistration {
        room {
          roomAnnouncements(first: 100000) @connection(key: "ExamMessages_roomAnnouncements", filters: []) {
            edges {
              node {
                createdAt
              }
            }
          }
        }
        examVersion {
          versionAnnouncements(first: 100000) @connection(key: "ExamMessages_versionAnnouncements", filters: []) {
            edges {
              node {
                createdAt
              }
            }
          }
        }
        messages(first: 100000) @connection(key: "ExamMessages_messages", filters: []) {
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
    .examAnnouncements.edges.map(({ node: { createdAt } }) => DateTime.fromISO(createdAt))
    .concat(
      res.myRegistration.room?.roomAnnouncements.edges.map(
         ({ node: { createdAt } }) => DateTime.fromISO(createdAt),
      ) ?? [],
    )
    .concat(
      res.myRegistration.examVersion.versionAnnouncements.edges.map(
        ({ node: { createdAt } }) => DateTime.fromISO(createdAt),
      ),
    )
    .concat(res.myRegistration.messages.edges.map(({ node }) => DateTime.fromISO(node.createdAt)));

  const anyUnread: boolean = dates.reduce((acc, date) => (acc || date > lastViewed), false);
  const classes = anyUnread ? 'bg-warning text-dark' : undefined;
  const glow = anyUnread ? 'glow-pulse-warning' : undefined;
  const tooltipClasses = anyUnread ? 'bg-warning text-dark' : undefined;
  const [curState, setCurState] = useState<NewMessageWarning>('noWarning');
  useEffect(() => {
    // each time unread messages appear, we'll reset whether the
    // tooltip appears based on whether we're currently expanded
    if (anyUnread) {
      if (expanded) {
        setCurState('warningDismissed');
      } else if (curState === 'noWarning') {
        setCurState('warningActivated');
      }
    } else {
      setCurState('noWarning');
    }
  }, [anyUnread, expanded]);
  let showTooltip;
  if (curState === 'warningActivated') {
    showTooltip = 'always';
  } else if (!expanded) {
    showTooltip = 'onHover';
  } else {
    showTooltip = 'never';
  }

  return (
    <NavAccordionItem
      showTooltip={showTooltip}
      tooltipMessage={anyUnread ? 'New messages' : 'Professor messages'}
      tooltipPlacement="right"
      tooltipClassname={tooltipClasses}
      glowClassName={glow}
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
