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
import { ExhaustiveSwitchError, SelectOption, SelectOptions } from '@hourglass/common/helpers';
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
  studentsByRoom: Record<RoomAnnouncement['id'], Record<DirectMessage['registration']['id'], boolean>>;
  studentsByVersion: Record<VersionAnnouncement['id'], Record<DirectMessage['registration']['id'], boolean>>;
  versions: Recipient[];
  versionsByRoom: Record<RoomAnnouncement['id'], Record<VersionAnnouncement['id'], boolean>>;
  roomsByVersion: Record<VersionAnnouncement['id'], Record<RoomAnnouncement['id'], boolean>>;
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
    room: {
      id: string;
    };
    examVersion: {
      id: string;
    };
    user: {
      id: string;
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
    room: {
      id: string;
    };
    examVersion: {
      id: string;
    };
    user: {
      id: string;
      displayName: string;
    };
  };
}

interface VersionAnnouncement {
  type: MessageType.Version;
  time: DateTime;
  id: string;
  version: {
    id: string;
    name: string;
  };
  body: string;
}

interface RoomAnnouncement {
  type: MessageType.Room;
  time: DateTime;
  id: string;
  room: {
    id: string;
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
  studentQuestions: Question[];
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

export const finalizeItemMutation = graphql`
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
  name: string;
  regFinal: boolean;
}> = (props) => {
  const {
    registrationId,
    name,
    regFinal,
  } = props;
  const [showModal, setShowModal] = useState(false);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
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
      <FinalizeDialog
        loading={loading}
        buttonText="Finalize this student"
        subjectName={name}
        subjectValue={registrationId}
        showModal={showModal}
        closeModal={closeModal}
        finalize={() => {
          closeModal();
          mutate({
            variables: {
              input: {
                id: registrationId,
              },
            },
          });
        }}
      />
      <TooltipButton
        disabled={disabled}
        disabledMessage={reason}
        enabledMessage="Finalize"
        variant="danger"
        onClick={openModal}
      >
        <Icon I={FaThumbsDown} />
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
        enabledMessage="Clear anomaly"
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
      priorAnomalyCount
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
      <td>{anomaly.priorAnomalyCount}</td>
      <td>{anomaly.reason}</td>
      <td className="d-flex">
        <div className="d-flex flex-fill">
          <FinalizeButton
            registrationId={anomaly.registration.id}
            name={anomaly.registration.user.displayName}
            regFinal={anomaly.registration.final}
          />
        </div>
        <div className="d-flex flex-fill">
          <ClearButton examId={examId} anomalyId={anomaly.id} />
        </div>
        <div className="d-flex flex-fill">
          <TooltipButton
            disabled={false}
            enabledMessage="Message student"
            variant="info"
            onClick={() => {
              replyTo(anomaly.registration.id);
            }}
          >
            <Icon I={MdMessage} />
          </TooltipButton>
        </div>
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

const ShowAnomalies: React.FC<{
  replyTo: (userId: string) => void;
  exam: exams_anomalies$key;
}> = (props) => {
  const {
    replyTo,
    exam,
  } = props;
  const { alert } = useContext(AlertContext);
  const {
    data,
    isLoading,
    hasNext,
    loadNext,
  } = usePagination(
    graphql`
      fragment exams_anomalies on Exam
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 20 }
        cursor: { type: "String" }
      )
      @refetchable(queryName: "examsAnomalyPaginationQuery") {
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
      examId: data.id,
    },
    configs: [{
      type: 'RANGE_ADD',
      parentID: data.id,
      connectionInfo: [{
        key: 'Exam_anomalies',
        rangeBehavior: 'prepend',
      }],
      edgeName: 'anomalyEdge',
    }],
  }), [data.id]));

  useSubscription(useMemo(() => ({
    subscription: anomalyDestroyedSubscriptionSpec,
    variables: {
      examId: data.id,
    },
    configs: [{
      type: 'RANGE_DELETE',
      parentID: data.id,
      connectionKeys: [{
        key: 'Exam_anomalies',
      }],
      pathToConnection: ['exam', 'anomalies'],
      deletedIDFieldName: 'deletedId',
    }],
  }), [data.id]));

  return (
    <>
      {data.anomalies.edges.length === 0 && <tr><td colSpan={4}>No anomalies.</td></tr>}
      {data.anomalies.edges.map((edge) => (
        <ShowAnomaly key={edge.node.id} replyTo={replyTo} examId={data.id} anomalyKey={edge.node} />
      ))}
      {hasNext && (
        <tr>
          <td colSpan={4} className="text-center">
            <Button
              onClick={() => {
                if (!hasNext || isLoading) return;
                loadNext(
                  10,
                  {
                    onComplete: (error?: Error) => {
                      if (!error) return;
                      alert({
                        variant: 'danger',
                        title: 'Error fetching additional anomalies.',
                        message: error.message,
                        copyButton: true,
                      });
                    },
                  },
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

export const FinalizeDialog: React.FC<{
  loading: boolean;
  showModal: boolean;
  closeModal: () => void;
  subjectName: string;
  subjectValue: string;
  finalize: (string) => void;
  buttonText: string;
}> = (props) => {
  const {
    loading,
    showModal,
    closeModal,
    subjectName,
    subjectValue,
    finalize,
    buttonText,
  } = props;
  return (
    <Modal centered keyboard show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        Finalize
      </Modal.Header>
      <Modal.Body>
        <p>
          {'Are you sure you want to finalize '}
          <i>{subjectName}</i>
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
            onClick={() => finalize(subjectValue)}
          >
            {buttonText}
          </TooltipButton>
        </Loading>
      </Modal.Footer>
    </Modal>
  );
};

const FinalizeRegs: React.FC<{
  buttonText?: string;
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
  const finalize = (subjectValue) => {
    mutate({
      variables: {
        input: {
          id: subjectValue,
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
      <FinalizeDialog
        showModal={showModal}
        loading={loading}
        closeModal={closeModal}
        subjectName={selectedRecipient.label}
        subjectValue={selectedRecipient.value.id}
        finalize={finalize}
        buttonText="Finalize"
      />
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
                  <th># prior anomalies</th>
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

const ShowMessages: React.FC<{
  replyTo: (regId: string) => void;
  recipients: SplitRecipients;
  recipientOptions: RecipientOptions;
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
    recipients,
    recipientOptions,
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
  const [filter, setFilter] = useState<MessageFilterOption[]>(undefined);
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

  if (filter) {
    all = all.filter((m) => {
      switch (m.type) {
        case MessageType.Exam: return true;
        case MessageType.Direct:
        case MessageType.Question:
          return filter.some((f) => {
            switch (f.value.type) {
              case MessageType.Direct:
                return f.value.name === m.registration.user.displayName;
              case MessageType.Room:
                return f.value.id === m.registration.room?.id;
              case MessageType.Version:
                return f.value.id === m.registration.examVersion.id;
              case MessageType.Exam:
                return true;
              default:
                throw new ExhaustiveSwitchError(f.value.type);
            }
          });
        case MessageType.Room:
          return filter.some((f) => {
            switch (f.value.type) {
              case MessageType.Direct:
                return recipients.studentsByRoom[m.room?.id]?.[f.value.id];
              case MessageType.Room:
                return f.value.id === m.room?.id;
              case MessageType.Version:
                return recipients.versionsByRoom[m.room?.id]?.[f.value.id];
              case MessageType.Exam:
                return true;
              default:
                throw new ExhaustiveSwitchError(f.value.type);
            }
          });
        case MessageType.Version:
          return filter.some((f) => {
            switch (f.value.type) {
              case MessageType.Direct:
                return recipients.studentsByVersion[m.version.id]?.[f.value.id];
              case MessageType.Version:
                return f.value.id === m.version.id;
              case MessageType.Room:
                return recipients.roomsByVersion[m.version.id]?.[f.value.id];
              case MessageType.Exam:
                return true;
              default:
                throw new ExhaustiveSwitchError(f.value.type);
            }
          });
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
            isMulti
            placeholder="Choose selection criteria..."
            value={filter}
            onChange={(value: MessageFilterOption[], _action) => {
              if (value?.length > 0) {
                setFilter(value);
              } else {
                setFilter(undefined);
              }
            }}
            formatGroupLabel={formatGroupLabel}
            options={recipientOptions}
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
          room { id }
          examVersion { id }
          user { displayName }
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
      studentQuestion {
        id
        createdAt
        registration {
          id
          room { id }
          examVersion { id }
          user { displayName }
        }
        body
      }
      studentQuestionsEdge {
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
  recipients: SplitRecipients;
  recipientOptions: RecipientOptions;
}> = (props) => {
  const {
    selectedRecipient,
    setSelectedRecipient,
    messageRef,
    replyTo,
    examId,
    response,
    recipients,
    recipientOptions,
  } = props;
  const {
    sent,
    studentQuestions: questions,
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
        key: 'Exam_studentQuestions',
        rangeBehavior: 'prepend',
      }],
      edgeName: 'studentQuestionsEdge',
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
                        recipients={recipients}
                        recipientOptions={recipientOptions}
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
                        recipients={recipients}
                        recipientOptions={recipientOptions}
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
                        recipients={recipients}
                        recipientOptions={recipientOptions}
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
  recipients: SplitRecipients;
  recipientOptions: RecipientOptions;
  exam: exams_messages$key;
}> = (props) => {
  const {
    selectedRecipient,
    setSelectedRecipient,
    messageRef,
    replyTo,
    recipients,
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
                id
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
                id
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
        studentQuestions(first: 100000) @connection(key: "Exam_studentQuestions", filters: []) {
          edges {
            node {
              id
              createdAt
              registration {
                id
                room {
                  id
                }
                examVersion {
                  id
                }
                user {
                  id
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
                room {
                  id
                }
                examVersion {
                  id
                }
                user {
                  id
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
    studentQuestions: res.studentQuestions.edges.map(({ node: question }) => ({
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
    res.studentQuestions,
    res.versionAnnouncements,
    res.examAnnouncements,
    res.roomAnnouncements,
  ]);
  return (
    <Loaded
      examId={res.id}
      recipients={recipients}
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
  const roomOptions: SelectOptions<Recipient> = recipients.rooms.map((r) => ({
    label: r.name,
    // This toString is needed because otherwise some CSS
    // mangler tries to convert this value directly to a string
    // to be used as a key, and then we get duplicate keys
    // since they're all [object Object]
    value: { ...r, toString: ((): string => r.id), type: MessageType.Room },
  }));
  roomOptions.unshift({ label: 'No room', value: { type: MessageType.Room, id: undefined, name: 'No room' } });
  const recipientOptions = useMemo<RecipientOptions>(() => ([
    {
      label: 'Entire exam',
      options: [{
        label: 'Entire exam',
        value: {
          type: MessageType.Exam,
          id: examId,
          // This toString is needed because otherwise some CSS
          // mangler tries to convert this value directly to a string
          // to be used as a key, and then we get duplicate keys
          // since they're all [object Object]
          toString: () => examId,
          name: 'Entire exam',
        },
      }],
    },
    {
      label: 'Rooms',
      options: roomOptions,
    },
    {
      label: 'Versions',
      options: recipients.versions.map((r) => ({
        label: r.name,
        // ditto
        value: { ...r, toString: ((): string => r.id), type: MessageType.Version },
      })),
    },
    {
      label: 'Students',
      options: recipients.students.map((r) => ({
        label: r.name,
        // ditto
        value: { ...r, toString: ((): string => r.id), type: MessageType.Direct },
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
          recipients={recipients}
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
        room { id }
        examVersion { id }
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
  const students: Recipient[] = [];
  const studentsByRoom: Record<RoomAnnouncement['id'], Record<DirectMessage['registration']['id'], boolean>> = {};
  const versionsByRoom: Record<RoomAnnouncement['id'], Record<VersionAnnouncement['id'], boolean>> = {};
  const studentsByVersion: Record<VersionAnnouncement['id'], Record<DirectMessage['registration']['id'], boolean>> = {};
  const roomsByVersion: Record<VersionAnnouncement['id'], Record<RoomAnnouncement['id'], boolean>> = {};
  res.registrations.forEach((reg) => {
    const r: Recipient = {
      type: MessageType.Direct,
      id: reg.id,
      name: reg.user.displayName,
    };
    students.push(r);
    studentsByRoom[reg.room?.id] = studentsByRoom[reg.room?.id] ?? {};
    studentsByRoom[reg.room?.id][reg.id] = true;
    studentsByVersion[reg.examVersion.id] = studentsByVersion[reg.examVersion.id] ?? {};
    studentsByVersion[reg.examVersion.id][reg.id] = true;
    versionsByRoom[reg.room?.id] = versionsByRoom[reg.room?.id] ?? {};
    versionsByRoom[reg.room?.id][reg.examVersion.id] = true;
    roomsByVersion[reg.examVersion.id] = roomsByVersion[reg.examVersion.id] ?? {};
    roomsByVersion[reg.examVersion.id][reg.room?.id] = true;
  });
  const sortByName = (a, b) => a.name.localeCompare(b.name);
  const recipients: SplitRecipients = useMemo(() => ({
    versions: res.examVersions.edges.map(({ node: ev }) => {
      const r: Recipient = {
        type: MessageType.Version,
        id: ev.id,
        name: ev.name,
      };
      return r;
    }).sort(sortByName),
    students: students.sort(sortByName),
    studentsByRoom,
    studentsByVersion,
    rooms: res.rooms.map((room) => {
      const r: Recipient = {
        type: MessageType.Room,
        id: room.id,
        name: room.name,
      };
      return r;
    }).sort(sortByName),
    versionsByRoom,
    roomsByVersion,
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
  } = useParams<{ examId: string }>();
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
  if (!res.data) {
    return (
      <Container fluid>
        <RegularNavbar className="row" />
        <p>Loading...</p>
      </Container>
    );
  }
  return (
    <DocumentTitle title={`${res.data.exam.name} - Proctoring`}>
      <Container fluid>
        <div className="wrapper vh-100">
          <div className="inner-wrapper">
            <RegularNavbar className="row" />
            <Row>
              <Col>
                <h1>{res.data.exam.name}</h1>
              </Col>
            </Row>
            <div className="content-wrapper">
              <div className="content h-100">
                <ProctoringSplitView exam={res.data.exam} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </DocumentTitle>
  );
};

export default ExamProctoring;
