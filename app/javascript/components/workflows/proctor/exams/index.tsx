import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import RegularNavbar from '@hourglass/common/navbar';
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Tab,
  Nav,
  Form,
  Media,
  Alert,
  Modal,
} from 'react-bootstrap';
import ReadableDate from '@hourglass/common/ReadableDate';
import {
  FaThumbsUp,
  FaThumbsDown,
  FaInbox,
  FaList,
} from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import { MdMessage, MdSend, MdPeople } from 'react-icons/md';
import Loading from '@hourglass/common/loading';
import { AlertContext } from '@hourglass/common/alerts';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import { ExhaustiveSwitchError, SelectOption } from '@hourglass/common/helpers';
import { GiBugleCall } from 'react-icons/gi';
import { DateTime } from 'luxon';
import { IconType } from 'react-icons';
import './index.scss';
import { BsListCheck } from 'react-icons/bs';
import { NewMessages, PreviousMessages } from '@hourglass/common/messages';
import { graphql } from 'react-relay';
import DocumentTitle from '@hourglass/common/documentTitle';
import {
  useFragment,
  useMutation,
  useSubscription,
  usePagination,
  useQuery,
} from 'relay-hooks';
import { RenderError } from '@hourglass/common/boundary';

import { examsProctorQuery } from './__generated__/examsProctorQuery.graphql';
import { exams_recipients$key, exams_recipients$data } from './__generated__/exams_recipients.graphql';
import { exams_anomalies$key } from './__generated__/exams_anomalies.graphql';
import { exams_anomaly$key } from './__generated__/exams_anomaly.graphql';
import { examsFinalizeItemMutation } from './__generated__/examsFinalizeItemMutation.graphql';
import { examsDestroyAnomalyMutation } from './__generated__/examsDestroyAnomalyMutation.graphql';
import { examsSendMessageMutation } from './__generated__/examsSendMessageMutation.graphql';
import { exams_messages$key } from './__generated__/exams_messages.graphql';

export interface Recipient {
  type: MessageType.Direct | MessageType.Room | MessageType.Version | MessageType.Exam;
  id: string;
  name: string;
}

export interface SplitRecipients {
  rooms: Recipient[];
  students: Recipient[];
  versions: Recipient[];
}

enum MessageType {
  Direct = 'DIRECT',
  Question = 'QUESTION',
  Room = 'ROOM',
  Version = 'VERSION',
  Exam = 'EXAM',
}

interface DirectMessage {
  type: MessageType.Direct;
  id: string;
  time: DateTime;
  body: string;
  sender: {
    isMe: boolean;
    displayName: string;
  };
  registration: {
    id: string;
    user: {
      displayName: string;
    };
  };
}

interface Question {
  type: MessageType.Question;
  time: DateTime;
  id: string;
  body: string;
  registration: {
    id: string;
    user: {
      displayName: string;
    };
  };
}

interface VersionAnnouncement {
  type: MessageType.Version;
  time: DateTime;
  id: string;
  version: {
    name: string;
  };
  body: string;
}

interface RoomAnnouncement {
  type: MessageType.Room;
  time: DateTime;
  id: string;
  room: {
    name: string;
  };
  body: string;
}

interface ExamAnnouncement {
  type: MessageType.Exam;
  id: string;
  body: string;
  time: DateTime;
}

interface Response {
  sent: DirectMessage[];
  questions: Question[];
  version: VersionAnnouncement[];
  room: RoomAnnouncement[];
  exam: ExamAnnouncement[];
}

type Message = Question | DirectMessage | VersionAnnouncement | RoomAnnouncement | ExamAnnouncement;

export interface MessageProps {
  icon: IconType;
  iconClass?: string;
  tooltip: string;
  time: DateTime;
  body: React.ReactElement | string;
}

const ShowMessage: React.FC<MessageProps> = (props) => {
  const {
    icon,
    iconClass,
    tooltip,
    time,
    body,
    children,
  } = props;
  return (
    <Media>
      <span className="mr-2">
        <Icon I={icon} className={iconClass} />
      </span>
      <Media.Body>
        <p className="m-0">
          <i className="text-muted">
            {`${tooltip} (${time.toLocaleString(DateTime.TIME_SIMPLE)})`}
          </i>
          {children}
        </p>
        <p className="wrap-anywhere">{body}</p>
      </Media.Body>
    </Media>
  );
};

const finalizeItemMutation = graphql`
mutation examsFinalizeItemMutation($input: FinalizeItemInput!) {
  finalizeItem(input: $input) {
    exam {
      registrations {
        id
        final
      }
    }
  }
}
`;

const FinalizeButton: React.FC<{
  registrationId: string;
  regFinal: boolean;
}> = (props) => {
  const {
    registrationId,
    regFinal,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<examsFinalizeItemMutation>(
    finalizeItemMutation,
    {
      onCompleted: () => {
        alert({
          variant: 'success',
          autohide: true,
          message: 'Registration finalized.',
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error finalizing registration',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const disabled = loading || regFinal;
  const reason = loading ? 'Loading...' : 'Already final';
  return (
    <Loading loading={loading}>
      <TooltipButton
        disabled={disabled}
        disabledMessage={reason}
        variant="danger"
        onClick={() => {
          mutate({
            variables: {
              input: {
                id: registrationId,
              },
            },
          });
        }}
      >
        <Icon I={FaThumbsDown} />
        Finalize
      </TooltipButton>
    </Loading>
  );
};

const ClearButton: React.FC<{
  examId: string;
  anomalyId: string;
}> = (props) => {
  const {
    examId,
    anomalyId,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<examsDestroyAnomalyMutation>(
    graphql`
    mutation examsDestroyAnomalyMutation($input: DestroyAnomalyInput!) {
      destroyAnomaly(input: $input) {
        deletedId
      }
    }
    `,
    {
      configs: [{
        type: 'RANGE_DELETE',
        parentID: examId,
        connectionKeys: [{
          key: 'Exam_anomalies',
        }],
        pathToConnection: ['exam', 'anomalies'],
        deletedIDFieldName: 'deletedId',
      }],
      onCompleted: () => {
        alert({
          variant: 'success',
          message: 'Anomaly cleared.',
          autohide: true,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error clearing anomaly',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <Loading loading={loading}>
      <TooltipButton
        disabled={loading}
        disabledMessage="Loading..."
        variant="success"
        onClick={() => {
          mutate({
            variables: {
              input: {
                anomalyId,
              },
            },
          });
        }}
      >
        <Icon I={FaThumbsUp} />
        Clear anomaly
      </TooltipButton>
    </Loading>
  );
};

const ShowAnomaly: React.FC<{
  replyTo: (userId: string) => void;
  examId: string;
  anomalyKey: exams_anomaly$key;
}> = (props) => {
  const {
    replyTo,
    examId,
    anomalyKey,
  } = props;
  const anomaly = useFragment(
    graphql`
    fragment exams_anomaly on Anomaly {
      id
      createdAt
      reason
      registration {
        id
        final
        user {
          id
          displayName
        }
      }
    }
    `,
    anomalyKey,
  );
  return (
    <tr key={anomaly.id}>
      <td>{anomaly.registration.user.displayName}</td>
      <td>
        <ReadableDate
          showTime
          value={DateTime.fromISO(anomaly.createdAt)}
        />
      </td>
      <td>{anomaly.reason}</td>
      <td>
        <FinalizeButton
          registrationId={anomaly.registration.id}
          regFinal={anomaly.registration.final}
        />
        <ClearButton examId={examId} anomalyId={anomaly.id} />
        <Button
          variant="info"
          onClick={() => {
            replyTo(anomaly.registration.id);
          }}
        >
          <Icon I={MdMessage} />
          Message student
        </Button>
      </td>
    </tr>
  );
};

const newAnomalySubscriptionSpec = graphql`
  subscription examsNewAnomalySubscription($examId: ID!) {
    anomalyWasCreated(examId: $examId) {
      anomaly {
        ...exams_anomaly
      }
      anomalyEdge {
        node {
          id
        }
      }
    }
  }
`;

const anomalyDestroyedSubscriptionSpec = graphql`
  subscription examsAnomalyDestroyedSubscription($examId: ID!) {
    anomalyWasDestroyed(examId: $examId) {
      deletedId
    }
  }
`;

const paginationConfig = {
  getVariables(_props, { count, cursor }, fragmentVariables) {
    return {
      count,
      cursor,
      examId: fragmentVariables.examId,
    };
  },
  query: graphql`
  query examsAnomalyPaginationQuery(
    $count: Int!
    $cursor: String
    $examId: ID!
  ) {
    exam: node(id: $examId) {
      ...exams_anomalies @arguments(count: $count, cursor: $cursor)
    }
  }
  `,
};

const ShowAnomalies: React.FC<{
  replyTo: (userId: string) => void;
  exam: exams_anomalies$key;
}> = (props) => {
  const {
    replyTo,
    exam,
  } = props;
  const { alert } = useContext(AlertContext);
  const [res, { isLoading, hasMore, loadMore }] = usePagination(
    graphql`
      fragment exams_anomalies on Exam
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 20 }
        cursor: { type: "String" }
      ) {
        id
        anomalies(
          first: $count
          after: $cursor
        ) @connection(key: "Exam_anomalies", filters: []) {
          edges {
            node {
              id
              ...exams_anomaly
            }
          }
        }
      }
    `,
    exam,
  );

  useSubscription(useMemo(() => ({
    subscription: newAnomalySubscriptionSpec,
    variables: {
      examId: res.id,
    },
    configs: [{
      type: 'RANGE_ADD',
      parentID: res.id,
      connectionInfo: [{
        key: 'Exam_anomalies',
        rangeBehavior: 'prepend',
      }],
      edgeName: 'anomalyEdge',
    }],
  }), [res.id]));

  useSubscription(useMemo(() => ({
    subscription: anomalyDestroyedSubscriptionSpec,
    variables: {
      examId: res.id,
    },
    configs: [{
      type: 'RANGE_DELETE',
      parentID: res.id,
      connectionKeys: [{
        key: 'Exam_anomalies',
      }],
      pathToConnection: ['exam', 'anomalies'],
      deletedIDFieldName: 'deletedId',
    }],
  }), [res.id]));

  return (
    <>
      {res.anomalies.edges.length === 0 && <tr><td colSpan={4}>No anomalies.</td></tr>}
      {res.anomalies.edges.map((edge) => (
        <ShowAnomaly key={edge.node.id} replyTo={replyTo} examId={res.id} anomalyKey={edge.node} />
      ))}
      {hasMore() && (
        <tr>
          <td colSpan={4} className="text-center">
            <Button
              onClick={() => {
                if (!hasMore() || isLoading()) return;
                loadMore(
                  paginationConfig,
                  10,
                  (error) => {
                    if (!error) return;
                    alert({
                      variant: 'danger',
                      title: 'Error fetching additional anomalies.',
                      message: error.message,
                      copyButton: true,
                    });
                  },
                  {},
                );
              }}
              variant="success"
            >
              Load more...
            </Button>
          </td>
        </tr>
      )}
    </>
  );
};

const formatGroupLabel = (data) => {
  if (data.options.length > 1) {
    return (
      <div className="proctor-groupstyles">
        <span>{data.label}</span>
      </div>
    );
  }
  return <span />;
};

const FinalizeRegs: React.FC<{
  recipientOptions: RecipientOptions;
}> = (props) => {
  const {
    recipientOptions,
  } = props;
  const { alert } = useContext(AlertContext);
  const [selectedRecipient, setSelectedRecipient] = useState<MessageFilterOption>(
    recipientOptions[0].options[0],
  );
  const [showModal, setShowModal] = useState(false);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
  const [mutate, { loading }] = useMutation<examsFinalizeItemMutation>(
    finalizeItemMutation,
    {
      onCompleted: () => {
        closeModal();
        alert({
          variant: 'success',
          title: 'Finalization successful',
          message: `Finalized '${selectedRecipient.label}'.`,
          autohide: true,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: `Error finalizing '${selectedRecipient.label}'`,
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const finalize = () => {
    mutate({
      variables: {
        input: {
          id: selectedRecipient.value.id,
        },
      },
    });
  };
  return (
    <>
      <Alert variant="danger">
        <h2>Finalization</h2>
        <Form.Group as={Row} controlId="finalize-target-box">
          <Form.Label column sm="auto">Target:</Form.Label>
          <Col>
            <Select
              placeholder="Choose selection criteria..."
              value={selectedRecipient}
              onChange={(value: MessageFilterOption) => {
                setSelectedRecipient(value);
              }}
              formatGroupLabel={formatGroupLabel}
              options={recipientOptions}
              menuPlacement="auto"
            />
          </Col>
        </Form.Group>
        <Form.Group>
          <Button
            variant="danger"
            onClick={openModal}
          >
            <Icon I={BsListCheck} />
            Finalize
          </Button>
        </Form.Group>
      </Alert>
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          Finalize
        </Modal.Header>
        <Modal.Body>
          <p>
            {'Are you sure you want to finalize '}
            <i>{selectedRecipient.label}</i>
            ?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={loading}
            variant="secondary"
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Loading loading={loading}>
            <TooltipButton
              disabled={loading}
              disabledMessage="Loading..."
              variant="danger"
              onClick={finalize}
            >
              Finalize
            </TooltipButton>
          </Loading>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const ExamAnomalies: React.FC<{
  replyTo: (userId: string) => void;
  recipientOptions: RecipientOptions;
  exam: exams_anomalies$key;
}> = (props) => {
  const {
    replyTo,
    recipientOptions,
    exam,
  } = props;
  return (
    <div className="wrapper h-100">
      <div className="inner-wrapper">
        <h2>Anomalies</h2>
        <div className="content-wrapper">
          <div className="content overflow-auto-y">
            <Table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Timestamp</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <ShowAnomalies replyTo={replyTo} exam={exam} />
              </tbody>
            </Table>
          </div>
        </div>
        <div>
          <FinalizeRegs recipientOptions={recipientOptions} />
        </div>
      </div>
    </div>
  );
};

const ShowExamAnnouncement: React.FC<{
  announcement: ExamAnnouncement;
}> = (props) => {
  const {
    announcement,
  } = props;
  const {
    body,
    time,
  } = announcement;
  return (
    <ShowMessage
      icon={GiBugleCall}
      tooltip="Sent to entire exam"
      body={body}
      time={time}
    />
  );
};

const ShowVersionAnnouncement: React.FC<{
  announcement: VersionAnnouncement;
}> = (props) => {
  const {
    announcement,
  } = props;
  const {
    version,
    body,
    time,
  } = announcement;
  return (
    <ShowMessage
      icon={MdPeople}
      tooltip={`Sent to ${version.name}`}
      body={body}
      time={time}
    />
  );
};

const ShowRoomAnnouncement: React.FC<{
  announcement: RoomAnnouncement;
}> = (props) => {
  const {
    announcement,
  } = props;
  const {
    room,
    body,
    time,
  } = announcement;
  return (
    <ShowMessage
      icon={MdPeople}
      tooltip={`Sent to ${room.name}`}
      body={body}
      time={time}
    />
  );
};

const ShowQuestion: React.FC<{
  question: Question;
  replyTo: (regId: string) => void;
}> = (props) => {
  const {
    question,
    replyTo,
  } = props;
  const {
    registration,
    body,
    time,
  } = question;
  const reply = useCallback(() => replyTo(registration.id), [registration.id]);
  return (
    <ShowMessage
      icon={MdMessage}
      tooltip={`Received from ${registration.user.displayName}`}
      body={body}
      time={time}
    >
      <Button
        className="text-nowrap float-right"
        variant="info"
        onClick={reply}
      >
        <Icon I={MdSend} />
        Reply
      </Button>
    </ShowMessage>
  );
};

const ShowDirectMessage: React.FC<{
  message: DirectMessage;
}> = (props) => {
  const {
    message,
  } = props;
  const {
    sender,
    registration,
    body,
    time,
  } = message;
  const senderName = `${sender.displayName}${sender.isMe ? ' (you)' : ''}`;
  return (
    <ShowMessage
      icon={MdSend}
      tooltip={`Sent by ${senderName} to ${registration.user.displayName}`}
      body={body}
      time={time}
    />
  );
};

const SingleMessage: React.FC<{
  message: Message;
  replyTo: (regId: string) => void;
}> = (props) => {
  const {
    message,
    replyTo,
  } = props;
  switch (message.type) {
    case MessageType.Direct:
      return <ShowDirectMessage message={message} />;
    case MessageType.Question:
      return <ShowQuestion replyTo={replyTo} question={message} />;
    case MessageType.Room:
      return <ShowRoomAnnouncement announcement={message} />;
    case MessageType.Version:
      return <ShowVersionAnnouncement announcement={message} />;
    case MessageType.Exam:
      return <ShowExamAnnouncement announcement={message} />;
    default:
      throw new ExhaustiveSwitchError(message);
  }
};

type FilterVals = SelectOption<string>;

const ShowMessages: React.FC<{
  replyTo: (regId: string) => void;
  receivedOnly?: boolean;
  sentOnly?: boolean;
  sent: DirectMessage[];
  questions: Question[];
  version: VersionAnnouncement[];
  room: RoomAnnouncement[];
  exam: ExamAnnouncement[];
}> = (props) => {
  const {
    replyTo,
    receivedOnly = false,
    sentOnly = false,
    questions,
    sent,
    version,
    room,
    exam,
  } = props;
  const [lastViewed, setLastViewed] = useState<DateTime>(DateTime.local());
  const resetLastViewed = useCallback(() => setLastViewed(DateTime.local()), []);
  const [filter, setFilter] = useState<FilterVals>(undefined);
  let all: Array<Message> = [];
  if (!receivedOnly) {
    all = all
      .concat(sent)
      .concat(version)
      .concat(room)
      .concat(exam);
  }
  if (!sentOnly) {
    all = all.concat(questions);
  }

  const filterSet = all.reduce((acc, m) => {
    let option;
    switch (m.type) {
      case MessageType.Direct:
        option = m.registration.user.displayName;
        break;
      case MessageType.Question:
        option = m.registration.user.displayName;
        break;
      case MessageType.Room:
        option = m.room.name;
        break;
      case MessageType.Version:
        option = m.version.name;
        break;
      case MessageType.Exam:
        break;
      default:
        throw new ExhaustiveSwitchError(m);
    }
    if (option) {
      return acc.add(option);
    }
    return acc;
  }, new Set<FilterVals>());
  const filterOptions = [];
  filterSet.forEach((o) => {
    filterOptions.push({ value: o, label: o });
  });

  if (filter) {
    all = all.filter((m) => {
      switch (m.type) {
        case MessageType.Direct:
          return m.registration.user.displayName === filter.value;
        case MessageType.Question:
          return m.registration.user.displayName === filter.value;
        case MessageType.Room:
          return m.room.name === filter.value;
        case MessageType.Version:
          return m.version.name === filter.value;
        case MessageType.Exam:
          return true;
        default:
          throw new ExhaustiveSwitchError(m);
      }
    });
  }
  all.sort((a, b) => b.time.diff(a.time).milliseconds);
  const idx = all.findIndex((msg) => msg.time < lastViewed);
  const earlier = idx === -1 ? [] : all.slice(idx);
  const later = idx === -1 ? all : all.slice(0, idx);
  const dividerClass = later.length === 0 ? 'd-none' : '';

  return (
    <>
      <Form.Group className="d-flex" controlId="message-filter">
        <Form.Label column sm="auto" className="pl-0">Filter by:</Form.Label>
        <Col>
          <Select
            classNamePrefix="filterMessages"
            isClearable
            placeholder="Choose selection criteria..."
            value={filter}
            onChange={(value: FilterVals, _action) => {
              setFilter(value);
            }}
            options={filterOptions}
          />
        </Col>
      </Form.Group>
      <div className="content-wrapper h-100">
        <div className="content overflow-auto-y pr-3">
          <div className={dividerClass}>
            <NewMessages onClick={resetLastViewed} />
            {later.map((m) => (
              <div className="new-message" key={`${m.type}-${m.id}`}>
                <SingleMessage replyTo={replyTo} message={m} />
              </div>
            ))}
            {earlier.length > 0 && <PreviousMessages />}
          </div>
          {earlier.map((m) => (
            <SingleMessage key={`${m.type}-${m.id}`} replyTo={replyTo} message={m} />
          ))}
        </div>
      </div>
    </>
  );
};

enum MessagesTab {
  Timeline = 'timeline',
  Received = 'received',
  Sent = 'sent',
}

const newRoomAnnouncementSubscriptionSpec = graphql`
  subscription examsNewRoomAnnouncementSubscription($examId: ID!) {
    roomAnnouncementWasSent(examId: $examId) {
      roomAnnouncement {
        id
        createdAt
        body
        room {
          name
        }
      }
      roomAnnouncementsEdge {
        node {
          id
        }
      }
    }
  }
`;

const newVersionAnnouncementSubscriptionSpec = graphql`
  subscription examsNewVersionAnnouncementSubscription($examId: ID!) {
    versionAnnouncementWasSent(examId: $examId) {
      versionAnnouncement {
        id
        createdAt
        body
        examVersion {
          name
        }
      }
      versionAnnouncementsEdge {
        node {
          id
        }
      }
    }
  }
`;

const newExamAnnouncementSubscriptionSpec = graphql`
  subscription examsNewAnnouncementSubscription($examId: ID!) {
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

const newMessageSubscriptionSpec = graphql`
  subscription examsNewMessageSubscription($examId: ID!) {
    messageWasSent(examId: $examId) {
      message {
        id
        body
        createdAt
        sender {
          isMe
          displayName
        }
        registration {
          id
          user {
            displayName
          }
        }
      }
      messagesEdge {
        node {
          id
        }
      }
    }
  }
`;

const newQuestionSubscriptionSpec = graphql`
  subscription examsNewQuestionSubscription($examId: ID!) {
    questionWasAsked(examId: $examId) {
      question {
        id
        createdAt
        registration {
          id
          user {
            displayName
          }
        }
        body
      }
      questionsEdge {
        node {
          id
        }
      }
    }
  }
`;

const Loaded: React.FC<{
  selectedRecipient: MessageFilterOption;
  setSelectedRecipient: (option: MessageFilterOption) => void;
  messageRef: React.Ref<HTMLTextAreaElement>;
  replyTo: (regId: string) => void;
  examId: string;
  response: Response;
  recipientOptions: RecipientOptions;
}> = (props) => {
  const {
    selectedRecipient,
    setSelectedRecipient,
    messageRef,
    replyTo,
    examId,
    response,
    recipientOptions,
  } = props;
  const {
    sent,
    questions,
    version,
    room,
    exam,
  } = response;
  useSubscription(useMemo(() => ({
    subscription: newMessageSubscriptionSpec,
    variables: {
      examId,
    },
    configs: [{
      type: 'RANGE_ADD',
      parentID: examId,
      connectionInfo: [{
        key: 'Exam_messages',
        rangeBehavior: 'prepend',
      }],
      edgeName: 'messagesEdge',
    }],
  }), [examId]));

  useSubscription(useMemo(() => ({
    subscription: newQuestionSubscriptionSpec,
    variables: {
      examId,
    },
    configs: [{
      type: 'RANGE_ADD',
      parentID: examId,
      connectionInfo: [{
        key: 'Exam_questions',
        rangeBehavior: 'prepend',
      }],
      edgeName: 'questionsEdge',
    }],
  }), [examId]));

  useSubscription(useMemo(() => ({
    subscription: newExamAnnouncementSubscriptionSpec,
    variables: {
      examId,
    },
    configs: [{
      type: 'RANGE_ADD',
      parentID: examId,
      connectionInfo: [{
        key: 'Exam_examAnnouncements',
        rangeBehavior: 'prepend',
      }],
      edgeName: 'examAnnouncementsEdge',
    }],
  }), [examId]));

  useSubscription(useMemo(() => ({
    subscription: newVersionAnnouncementSubscriptionSpec,
    variables: {
      examId,
    },
    configs: [{
      type: 'RANGE_ADD',
      parentID: examId,
      connectionInfo: [{
        key: 'Exam_versionAnnouncements',
        rangeBehavior: 'prepend',
      }],
      edgeName: 'versionAnnouncementsEdge',
    }],
  }), [examId]));

  useSubscription(useMemo(() => ({
    subscription: newRoomAnnouncementSubscriptionSpec,
    variables: {
      examId,
    },
    configs: [{
      type: 'RANGE_ADD',
      parentID: examId,
      connectionInfo: [{
        key: 'Exam_roomAnnouncements',
        rangeBehavior: 'prepend',
      }],
      edgeName: 'roomAnnouncementsEdge',
    }],
  }), [examId]));

  const [tabName, setTabName] = useState<MessagesTab>(MessagesTab.Timeline);

  return (
    <Tab.Container activeKey={tabName}>
      <div className="wrapper h-100">
        <div className="inner-wrapper">
          <h2>Messages</h2>
          <Nav
            variant="tabs"
            activeKey={tabName}
            onSelect={(key: MessagesTab) => setTabName(key)}
          >
            <Nav.Item>
              <Nav.Link
                eventKey={MessagesTab.Timeline}
              >
                <Icon I={FaList} />
                <span className="ml-2">
                  Timeline
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey={MessagesTab.Received}
              >
                <Icon I={FaInbox} />
                <span className="ml-2">
                  Received
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey={MessagesTab.Sent}
              >
                <Icon I={MdSend} />
                <span className="ml-2">
                  Sent
                </span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <div className="content-wrapper border border-top-0 rounded-bottom">
            <div className="content h-100">
              <Tab.Content className="p-3 h-100">
                <Tab.Pane eventKey={MessagesTab.Timeline} className="h-100">
                  <div className="wrapper h-100">
                    <div className="inner-wrapper h-100">
                      <ShowMessages
                        replyTo={replyTo}
                        sent={sent}
                        questions={questions}
                        version={version}
                        room={room}
                        exam={exam}
                      />
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey={MessagesTab.Received} className="h-100">
                  <div className="wrapper h-100">
                    <div className="inner-wrapper h-100">
                      <ShowMessages
                        replyTo={replyTo}
                        sent={sent}
                        questions={questions}
                        version={version}
                        room={room}
                        exam={exam}
                        receivedOnly
                      />
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey={MessagesTab.Sent} className="h-100">
                  <div className="wrapper h-100">
                    <div className="inner-wrapper h-100">
                      <ShowMessages
                        replyTo={replyTo}
                        sent={sent}
                        questions={questions}
                        version={version}
                        room={room}
                        exam={exam}
                        sentOnly
                      />
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </div>
          </div>
          <div>
            <SendMessage
              recipientOptions={recipientOptions}
              selectedRecipient={selectedRecipient}
              setSelectedRecipient={setSelectedRecipient}
              messageRef={messageRef}
            />
          </div>
        </div>
      </div>
    </Tab.Container>
  );
};

const ExamMessages: React.FC<{
  selectedRecipient: MessageFilterOption;
  setSelectedRecipient: (option: MessageFilterOption) => void;
  messageRef: React.Ref<HTMLTextAreaElement>;
  replyTo: (registrationId: string) => void;
  recipientOptions: RecipientOptions;
  exam: exams_messages$key;
}> = (props) => {
  const {
    selectedRecipient,
    setSelectedRecipient,
    messageRef,
    replyTo,
    recipientOptions,
    exam,
  } = props;
  const res = useFragment(
    graphql`
      fragment exams_messages on Exam {
        id
        versionAnnouncements(first: 100000) @connection(key: "Exam_versionAnnouncements", filters: []) {
          edges {
            node {
              id
              createdAt
              body
              examVersion {
                name
              }
            }
          }
        }
        roomAnnouncements(first: 100000) @connection(key: "Exam_roomAnnouncements", filters: []) {
          edges {
            node {
              id
              createdAt
              body
              room {
                name
              }
            }
          }
        }
        examAnnouncements(first: 100000) @connection(key: "Exam_examAnnouncements", filters: []) {
          edges {
            node {
              id
              createdAt
              body
            }
          }
        }
        questions(first: 100000) @connection(key: "Exam_questions", filters: []) {
          edges {
            node {
              id
              createdAt
              registration {
                id
                user {
                  displayName
                }
              }
              body
            }
          }
        }
        messages(first: 100000) @connection(key: "Exam_messages", filters: []) {
          edges {
            node {
              id
              body
              createdAt
              sender {
                isMe
                displayName
              }
              registration {
                id
                user {
                  displayName
                }
              }
            }
          }
        }
      }
    `,
    exam,
  );
  const response: Response = useMemo(() => ({
    sent: res.messages.edges.map(({ node: msg }) => ({
      type: MessageType.Direct,
      id: msg.id,
      body: msg.body,
      sender: msg.sender,
      registration: msg.registration,
      time: DateTime.fromISO(msg.createdAt),
    })),
    questions: res.questions.edges.map(({ node: question }) => ({
      type: MessageType.Question,
      id: question.id,
      body: question.body,
      registration: question.registration,
      time: DateTime.fromISO(question.createdAt),
    })),
    version: res.versionAnnouncements.edges.map(({ node: va }) => ({
      type: MessageType.Version,
      id: va.id,
      body: va.body,
      version: va.examVersion,
      time: DateTime.fromISO(va.createdAt),
    })),
    exam: res.examAnnouncements.edges.map(({ node: ea }) => ({
      type: MessageType.Exam,
      id: ea.id,
      body: ea.body,
      time: DateTime.fromISO(ea.createdAt),
    })),
    room: res.roomAnnouncements.edges.map(({ node: ra }) => ({
      type: MessageType.Room,
      id: ra.id,
      body: ra.body,
      room: ra.room,
      time: DateTime.fromISO(ra.createdAt),
    })),
  }), [
    res.messages,
    res.questions,
    res.versionAnnouncements,
    res.examAnnouncements,
    res.roomAnnouncements,
  ]);
  return (
    <Loaded
      examId={res.id}
      recipientOptions={recipientOptions}
      response={response}
      selectedRecipient={selectedRecipient}
      setSelectedRecipient={setSelectedRecipient}
      messageRef={messageRef}
      replyTo={replyTo}
    />
  );
};

type MessageFilterOption = SelectOption<Recipient>;

const SendMessageButton: React.FC<{
  recipient: Recipient;
  message: string;
  onSuccess: () => void;
}> = (props) => {
  const {
    recipient,
    message,
    onSuccess,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<examsSendMessageMutation>(
    graphql`
      mutation examsSendMessageMutation($input: SendMessageInput!) {
        sendMessage(input: $input) {
          clientMutationId
        }
      }
    `,
    {
      onCompleted: () => {
        alert({
          variant: 'success',
          message: 'Message sent.',
          autohide: true,
        });
        onSuccess();
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error sending message',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const disabled = message === '' || loading;
  const disabledMessage = loading ? 'Loading...' : 'Enter a message to send';
  return (
    <Loading loading={loading} noText>
      <TooltipButton
        placement="top"
        disabled={disabled}
        disabledMessage={disabledMessage}
        variant="success"
        onClick={() => {
          mutate({
            variables: {
              input: {
                recipientId: recipient.id,
                message,
              },
            },
          });
        }}
      >
        <Icon I={MdSend} />
        Send
      </TooltipButton>
    </Loading>
  );
};

type RecipientOptions = {
  label: string;
  options: MessageFilterOption[];
}[]

const SendMessage: React.FC<{
  selectedRecipient: MessageFilterOption;
  setSelectedRecipient: (option: MessageFilterOption) => void;
  recipientOptions: RecipientOptions;
  messageRef: React.Ref<HTMLTextAreaElement>;
}> = (props) => {
  const {
    selectedRecipient,
    setSelectedRecipient,
    recipientOptions,
    messageRef,
  } = props;
  const [message, setMessage] = useState('');
  const resetVals = useCallback(() => {
    setMessage('');
  }, []);
  return (
    <>
      <h2>Send message</h2>
      <Form.Group as={Row} controlId="message-recipient-box">
        <Form.Label column sm="auto">To:</Form.Label>
        <Col>
          <Select
            placeholder="Choose selection criteria..."
            value={selectedRecipient}
            onChange={(value: MessageFilterOption) => {
              setSelectedRecipient(value);
            }}
            formatGroupLabel={formatGroupLabel}
            options={recipientOptions}
            menuPlacement="auto"
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Form.Label column sm="auto">Message:</Form.Label>
        <Col>
          <Form.Control
            ref={messageRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            as="textarea"
          />
        </Col>
      </Form.Group>
      <Form.Group>
        <SendMessageButton
          onSuccess={resetVals}
          recipient={selectedRecipient.value}
          message={message}
        />
      </Form.Group>
    </>
  );
};

const SplitViewLoaded: React.FC<{
  examId: string;
  exam: exams_recipients$data;
  recipients: SplitRecipients;
}> = (props) => {
  const {
    examId,
    exam,
    recipients,
  } = props;
  const { alert } = useContext(AlertContext);
  const messageRef = useRef<HTMLTextAreaElement>();
  const recipientOptions = useMemo<RecipientOptions>(() => ([
    {
      label: 'Entire exam',
      options: [{
        label: 'Entire exam',
        value: {
          type: MessageType.Exam,
          id: examId,
          name: 'Entire exam',
        },
      }],
    },
    {
      label: 'Rooms',
      options: recipients.rooms.map((r) => ({
        label: r.name,
        value: { ...r, type: MessageType.Room },
      })),
    },
    {
      label: 'Versions',
      options: recipients.versions.map((r) => ({
        label: r.name,
        value: { ...r, type: MessageType.Version },
      })),
    },
    {
      label: 'Students',
      options: recipients.students.map((r) => ({
        label: r.name,
        value: { ...r, type: MessageType.Direct },
      })),
    },
  ]), [recipients]);
  const [selectedRecipient, setSelectedRecipient] = useState<MessageFilterOption>(
    recipientOptions[0].options[0],
  );
  const replyTo = (registrationId: string) => {
    const recip = recipientOptions[3].options.find((option) => option.value.id === registrationId);
    if (!recip) {
      alert({
        variant: 'danger',
        title: 'Error replying to message',
        message: `Invalid registration ID: ${registrationId}`,
        copyButton: true,
      });
    }
    setSelectedRecipient(recip);
    if (messageRef.current) messageRef.current.focus();
  };
  return (
    <Row className="h-100">
      <Col sm={6}>
        <ExamAnomalies
          exam={exam}
          recipientOptions={recipientOptions}
          replyTo={replyTo}
        />
      </Col>
      <Col sm={6}>
        <ExamMessages
          exam={exam}
          recipientOptions={recipientOptions}
          selectedRecipient={selectedRecipient}
          setSelectedRecipient={setSelectedRecipient}
          messageRef={messageRef}
          replyTo={replyTo}
        />
      </Col>
    </Row>
  );
};

const ProctoringSplitView: React.FC<{
  exam: exams_recipients$key;
}> = (props) => {
  const {
    exam,
  } = props;
  const res = useFragment<exams_recipients$key>(
    graphql`
    fragment exams_recipients on Exam {
      ...exams_anomalies
      ...exams_messages
      id
      examVersions(first: 100) @connection(key: "Exam_examVersions", filters: []) {
        edges {
          node {
            id
            name
          }
        }
      }
      registrations {
        id
        user {
          id
          displayName
        }
      }
      rooms {
        id
        name
      }
    }
    `,
    exam,
  );
  const recipients: SplitRecipients = useMemo(() => ({
    versions: res.examVersions.edges.map(({ node: ev }) => {
      const r: Recipient = {
        type: MessageType.Version,
        id: ev.id,
        name: ev.name,
      };
      return r;
    }).sort((a, b) => a.name.localeCompare(b.name)),
    students: res.registrations.map((registration) => {
      const r: Recipient = {
        type: MessageType.Direct,
        id: registration.id,
        name: registration.user.displayName,
      };
      return r;
    }).sort((a, b) => a.name.localeCompare(b.name)),
    rooms: res.rooms.map((room) => {
      const r: Recipient = {
        type: MessageType.Room,
        id: room.id,
        name: room.name,
      };
      return r;
    }).sort((a, b) => a.name.localeCompare(b.name)),
  }), [res.examVersions, res.registrations, res.rooms]);
  return (
    <SplitViewLoaded
      exam={res}
      examId={res.id}
      recipients={recipients}
    />
  );
};

const ExamProctoring: React.FC = () => {
  const {
    examId,
  } = useParams();
  const res = useQuery<examsProctorQuery>(
    graphql`
    query examsProctorQuery($examId: ID!) {
      exam(id: $examId) {
        ...exams_recipients
        name
        id
      }
    }
    `,
    { examId },
  );
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.props) {
    return (
      <Container fluid>
        <RegularNavbar className="row" />
        <p>Loading...</p>
      </Container>
    );
  }
  return (
    <DocumentTitle title={`${res.props.exam.name} - Proctoring`}>
      <Container fluid>
        <div className="wrapper vh-100">
          <div className="inner-wrapper">
            <RegularNavbar className="row" />
            <Row>
              <Col>
                <h1>{res.props.exam.name}</h1>
              </Col>
            </Row>
            <div className="content-wrapper">
              <div className="content h-100">
                <ProctoringSplitView exam={res.props.exam} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </DocumentTitle>
  );
};

export default ExamProctoring;
