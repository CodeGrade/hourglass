import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useRef,
  Suspense,
  useEffect,
} from 'react';
import NewWindow from 'react-new-window';
import RegularNavbar, { NavbarBreadcrumbs, NavbarItem } from '@hourglass/common/navbar';
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
  Card,
} from 'react-bootstrap';
import ReadableDate from '@hourglass/common/ReadableDate';
import {
  FaThumbsUp,
  FaThumbsDown,
  FaInbox,
  FaList,
} from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import {
  MdMessage,
  MdSend,
  MdPeople,
} from 'react-icons/md';
import Loading from '@hourglass/common/loading';
import { AlertContext } from '@hourglass/common/alerts';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import {
  ExhaustiveSwitchError,
  SelectOption,
  SelectOptions,
  formatNuid,
  useMutationWithDefaults,
} from '@hourglass/common/helpers';
import { GiBugleCall } from 'react-icons/gi';
import { DateTime } from 'luxon';
import { IconType } from 'react-icons';
import './index.scss';
import { BsListCheck, BsPrinterFill } from 'react-icons/bs';
import { NewMessages, PreviousMessages } from '@hourglass/common/messages';
import DocumentTitle from '@hourglass/common/documentTitle';
import {
  graphql,
  useFragment,
  useSubscription,
  useLazyLoadQuery,
  usePaginationFragment,
} from 'react-relay';
import ErrorBoundary from '@hourglass/common/boundary';
import { FaviconRotation } from './Favicon';

import { examsProctorQuery } from './__generated__/examsProctorQuery.graphql';
import { exams_anomalies$key } from './__generated__/exams_anomalies.graphql';
import { exams_anomaly$key } from './__generated__/exams_anomaly.graphql';
import { examsFinalizeItemMutation } from './__generated__/examsFinalizeItemMutation.graphql';
import { examsDestroyAnomalyMutation } from './__generated__/examsDestroyAnomalyMutation.graphql';
import { examsSendMessageMutation } from './__generated__/examsSendMessageMutation.graphql';
import { exams_messages$key } from './__generated__/exams_messages.graphql';
import { exams_proctoring$data, exams_proctoring$key } from './__generated__/exams_proctoring.graphql';
import { exams_pins$key } from './__generated__/exams_pins.graphql';
import { examsProctorRoleQuery } from './__generated__/examsProctorRoleQuery.graphql';

export interface Recipient {
  type: MessageType.Direct | MessageType.Room | MessageType.Version | MessageType.Exam;
  id: string;
  name: string;
  nuid?: number;
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

const ShowMessage: React.FC<React.PropsWithChildren<MessageProps>> = (props) => {
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
  const [mutate, loading] = useMutationWithDefaults<examsFinalizeItemMutation>(
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
  const [mutate, loading] = useMutationWithDefaults<examsDestroyAnomalyMutation>(
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
  filterBy: (displayName: string, regId: string) => boolean;
}> = (props) => {
  const {
    replyTo,
    examId,
    anomalyKey,
    filterBy,
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
  return (filterBy(anomaly.registration.user.displayName, anomaly.registration.id) ? (
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
  ) : undefined);
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
  filterBy: (displayName: string, regId: string) => boolean;
  updateAnomalyCount?: (anomalies: number) => void;
}> = (props) => {
  const {
    replyTo,
    exam,
    filterBy,
    updateAnomalyCount,
  } = props;
  const { alert } = useContext(AlertContext);
  const {
    data,
    isLoadingNext,
    hasNext,
    loadNext,
  } = usePaginationFragment(
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

  useEffect(() => {
    updateAnomalyCount(data.anomalies.edges.length);
  }, [data.anomalies.edges.length]);

  return (
    <>
      {data.anomalies.edges.length === 0 && <tr><td colSpan={4}>No anomalies.</td></tr>}
      {data.anomalies.edges.map((edge) => (
        <ShowAnomaly
          key={edge.node.id}
          replyTo={replyTo}
          examId={data.id}
          anomalyKey={edge.node}
          filterBy={filterBy}
        />
      ))}
      {hasNext && (
        <tr>
          <td colSpan={4} className="text-center">
            <Button
              onClick={() => {
                if (!hasNext || isLoadingNext) return;
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
  const [mutate, loading] = useMutationWithDefaults<examsFinalizeItemMutation>(
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
  recipients: SplitRecipients;
  recipientOptions: RecipientOptions;
  exam: exams_anomalies$key;
  updateAnomalyCount?: (anomalies: number) => void;
}> = (props) => {
  const {
    replyTo,
    recipients,
    recipientOptions,
    exam,
    updateAnomalyCount,
  } = props;
  const [filter, setFilter] = useState<MessageFilterOption[]>(undefined);
  const filterBy = useMemo(() => makeRegistrationFilter(recipients, filter), [filter]);
  return (
    <div className="wrapper h-100">
      <div className="inner-wrapper">
        <h2>Anomalies</h2>
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
                <ShowAnomalies
                  replyTo={replyTo}
                  exam={exam}
                  filterBy={filterBy}
                  updateAnomalyCount={updateAnomalyCount}
                />
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
  updateUnreadCount?: (messages: number) => void;
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
    updateUnreadCount,
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
  useEffect(() => { updateUnreadCount?.(later.length); }, [later.length]);
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
  updateUnreadCount?: (messages: number) => void
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
    updateUnreadCount,
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

  const curUnread: React.MutableRefObject<Record<MessagesTab, number>> = useRef({
    [MessagesTab.Timeline]: 0,
    [MessagesTab.Received]: 0,
    [MessagesTab.Sent]: 0,
  });
  const [tabName, setTabName] = useState<MessagesTab>(MessagesTab.Timeline);
  const updateTimelineUnread = useCallback((unread: number) => {
    curUnread.current[MessagesTab.Timeline] = unread;
    if (tabName === MessagesTab.Timeline) { updateUnreadCount?.(unread); }
  }, [updateUnreadCount, tabName]);
  const updateSentUnread = useCallback((unread: number) => {
    curUnread.current[MessagesTab.Sent] = unread;
    if (tabName === MessagesTab.Sent) { updateUnreadCount?.(unread); }
  }, [updateUnreadCount, tabName]);
  const updateReceivedUnread = useCallback((unread: number) => {
    curUnread.current[MessagesTab.Received] = unread;
    if (tabName === MessagesTab.Received) { updateUnreadCount?.(unread); }
  }, [updateUnreadCount, tabName]);
  useEffect(() => {
    updateUnreadCount?.(curUnread.current[tabName]);
  }, [tabName]);

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
                        updateUnreadCount={updateTimelineUnread}
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
                        updateUnreadCount={updateReceivedUnread}
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
                        updateUnreadCount={updateSentUnread}
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
  updateUnreadCount?: (messages: number) => void;
}> = (props) => {
  const {
    selectedRecipient,
    setSelectedRecipient,
    messageRef,
    replyTo,
    recipients,
    recipientOptions,
    exam,
    updateUnreadCount,
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
      updateUnreadCount={updateUnreadCount}
      messageRef={messageRef}
      replyTo={replyTo}
    />
  );
};

type MessageFilterOption = SelectOption<Recipient>;

const SendMessageButton: React.FC<{
  message: string;
  loading: boolean;
  doSend: () => void;
}> = (props) => {
  const {
    message,
    loading,
    doSend,
  } = props;
  const disabled = message === '' || loading;
  const disabledMessage = loading ? 'Loading...' : 'Enter a message to send';
  return (
    <Loading loading={loading} noText>
      <TooltipButton
        placement="top"
        disabled={disabled}
        disabledMessage={disabledMessage}
        variant="success"
        onClick={(e) => {
          e.currentTarget.blur();
          doSend();
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
  const { alert } = useContext(AlertContext);
  const [mutate, loading] = useMutationWithDefaults<examsSendMessageMutation>(
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
        resetVals();
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
  const doSend = () => {
    mutate({
      variables: {
        input: {
          recipientId: selectedRecipient.value.id,
          message,
        },
      },
    });
  };
  return (
    <>
      <h2>Send message</h2>
      <Form.Group as={Row} controlId="message-recipient-box">
        <Form.Label column sm="auto">To:</Form.Label>
        <Col>
          <Select
            isDisabled={loading}
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
            disabled={loading}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            as="textarea"
            onKeyDown={(e) => {
              // ctrl+enter
              if ((e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
                doSend();
              }
            }}
          />
        </Col>
      </Form.Group>
      <Form.Group>
        <span className="float-right text-secondary">
          Enter: newline, Ctrl+enter: send
        </span>
        <SendMessageButton
          message={message}
          loading={loading}
          doSend={doSend}
        />
      </Form.Group>
    </>
  );
};

const SplitViewLoaded: React.FC<{
  exam: exams_proctoring$data;
  recipients: SplitRecipients;
  recipientOptions: RecipientOptions;
  updateUnreadCount?: (messages: number) => void;
  updateAnomalyCount?: (anomalies: number) => void;
}> = (props) => {
  const {
    exam,
    recipients,
    recipientOptions,
    updateUnreadCount,
    updateAnomalyCount,
  } = props;
  const { alert } = useContext(AlertContext);
  const messageRef = useRef<HTMLTextAreaElement>();

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
          recipients={recipients}
          recipientOptions={recipientOptions}
          replyTo={replyTo}
          updateAnomalyCount={updateAnomalyCount}
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
          updateUnreadCount={updateUnreadCount}
          replyTo={replyTo}
        />
      </Col>
    </Row>
  );
};

const makeRegistrationFilter = (
  recipients: SplitRecipients,
  filter: MessageFilterOption[],
) => (displayName: string, regId: string) => (
  (filter === undefined) || filter.some((f) => {
    switch (f.value.type) {
      case MessageType.Direct:
        return f.value.name === displayName;
      case MessageType.Room:
        return recipients.studentsByRoom[f.value.id]?.[regId];
      case MessageType.Version:
        return recipients.studentsByVersion[f.value.id]?.[regId];
      case MessageType.Exam:
        return true;
      default:
        throw new ExhaustiveSwitchError(f.value.type);
    }
  })
);

const registrationWasUpdatedSubscriptionSpec = graphql`
  subscription examsRegistrationWasUpdatedSubscription($examId: ID!) {
    registrationWasUpdated(examId: $examId) {
      registration {
        id
        currentPin
        pinValidated
      }
    }
  }
`;

const ShowCurrentPins: React.FC<{
  enabled: boolean;
  recipients: SplitRecipients;
  recipientOptions: RecipientOptions;
  exam: exams_pins$key;
}> = (props) => {
  const {
    recipients,
    recipientOptions,
    exam,
    enabled,
  } = props;
  const [showing, setShowing] = useState(false);
  const [pinWindow, togglePINWindow] = useState(false);
  const res = useFragment<exams_pins$key>(
    graphql`
    fragment exams_pins on Exam
    @refetchable(queryName: "RegistrationPinRefetchQuery") {
      registrations {
        id
        currentPin
        pinValidated
      }
    }
    `,
    exam,
  );
  const { registrations } = res;
  const regsById = new Map(registrations.map((r) => [r.id, r]));
  const studentPins = recipients.students.map((s) => ({
    id: s.id,
    name: s.name,
    nuid: s.nuid,
    currentPin: regsById.get(s.id)?.currentPin,
    pinValidated: regsById.get(s.id)?.pinValidated,
  }));
  return (
    <>
      <Button
        variant="info"
        className="float-right"
        disabled={!enabled}
        onClick={() => setShowing(true)}
      >
        Show current PINs
      </Button>
      {pinWindow && (
        <NewWindow
          onUnload={() => togglePINWindow(false)}
        >
          <PrintablePinsTable
            students={studentPins}
          />
        </NewWindow>
      )}
      <Modal
        centered
        keyboard
        scrollable
        show={showing}
        onHide={() => {
          setShowing(false);
          togglePINWindow(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="w-100">
            Current PINs for students
            <Button
              disabled={pinWindow}
              className="float-right"
              onClick={() => togglePINWindow(true)}
              title="Open in new window to print"
            >
              <Icon I={BsPrinterFill} />
            </Button>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Suspense fallback={<p>Loading...</p>}>
            <ShowCurrentPinsTable
              recipients={recipients}
              recipientOptions={recipientOptions}
              students={studentPins}
            />
          </Suspense>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => setShowing(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const PrintablePinsTable: React.FC<{
  students: Array<{
    name: string,
    nuid: number,
    pinValidated: boolean,
    currentPin: string,
  }>,
}> = (props) => {
  const {
    students,
  } = props;
  const chunkSize = 4;
  const sortedStudents = students.toSorted((s1, s2) => s1.name.localeCompare(s2.name));
  const allInChunks = Array.from(
    { length: Math.ceil(sortedStudents.length / chunkSize) },
    (v, i) => sortedStudents.slice(i * chunkSize, i * chunkSize + chunkSize),
  );

  return (
    <table className="w-100 printTable" style={{ pageBreakInside: 'avoid' }}>
      <thead>
        {Array.from(
          { length: chunkSize },
          () => <th style={{ width: '25%', textAlign: 'center' }} />,
        )}
      </thead>
      <tbody>
        {allInChunks.map((chunk) => (
          <tr>
            {chunk.map((reg) => {
              let row: React.ReactElement;
              if (reg.pinValidated) {
                row = <span>Already validated</span>;
              } else if (reg.currentPin) {
                row = <span style={{ fontFamily: 'monospace' }}>{reg.currentPin}</span>;
              } else {
                row = <span>none required</span>;
              }
              return (
                <td style={{ height: '100%' }}>
                  <Card.Title>{reg.name}</Card.Title>
                  <table className="pinInfo">
                    {reg.nuid && (
                      <tr className="nuid">
                        <td>NUID:</td>
                        <td style={{ fontFamily: 'monospace' }}>
                          {formatNuid(reg.nuid)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td>PIN:</td>
                      <td>{row}</td>
                    </tr>
                  </table>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ShowCurrentPinsTable: React.FC<{
  recipients: SplitRecipients,
  recipientOptions: RecipientOptions,
  students: Array<{
    id: string,
    name: string,
    nuid: number,
    pinValidated: boolean,
    currentPin: string,
  }>,
}> = (props) => {
  const {
    recipients,
    recipientOptions,
    students,
  } = props;
  const [filter, setFilter] = useState<MessageFilterOption[]>(undefined);
  const filterBy = useMemo(() => makeRegistrationFilter(recipients, filter), [filter]);
  let all: typeof students = [];
  if (filter) {
    all = students.filter((s) => filterBy(s.name, s.id));
  } else {
    all = students;
  }

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
      <Row>
        <Table hover className="m-0">
          <thead>
            <tr>
              <th>NUID</th>
              <th>Student</th>
              <th>Current PIN</th>
            </tr>
          </thead>
          <tbody>
            {all.map((reg) => {
              let row: React.ReactElement;
              if (reg.pinValidated) {
                row = <td>Already validated</td>;
              } else if (reg.currentPin) {
                row = <td style={{ fontFamily: 'monospace' }}>{reg.currentPin}</td>;
              } else {
                row = <td>none required</td>;
              }
              return (
                <tr key={reg.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75em' }}>{formatNuid(reg.nuid)}</td>
                  <td>{reg.name}</td>
                  {row}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Row>
    </>
  );
};

const ExamProctoring: React.FC = () => (
  <ErrorBoundary>
    <Suspense
      fallback={(
        <Container fluid>
          <RegularNavbar className="row" />
          <p>Loading...</p>
        </Container>
      )}
    >
      <ExamProctoringQuery />
    </Suspense>
  </ErrorBoundary>
);

const ProctoringRecipients: React.FC<{
  exam: exams_proctoring$key;
  course?: { id: string, title: string };
}> = (props) => {
  const {
    exam,
    course,
  } = props;
  const res = useFragment<exams_proctoring$key>(
    graphql`
    fragment exams_proctoring on Exam {
      ...exams_anomalies
      ...exams_messages
      ...exams_pins
      id
      name
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
          nuid
        }
        currentPin
      }
      rooms {
        id
        name
      }
    }
    `,
    exam,
  );
  useSubscription(useMemo(() => ({
    subscription: registrationWasUpdatedSubscriptionSpec,
    variables: {
      examId: res.id,
    },
  }), [res.id]));
  const students: Recipient[] = [];
  const studentsByRoom: Record<RoomAnnouncement['id'], Record<DirectMessage['registration']['id'], boolean>> = {};
  const versionsByRoom: Record<RoomAnnouncement['id'], Record<VersionAnnouncement['id'], boolean>> = {};
  const studentsByVersion: Record<VersionAnnouncement['id'], Record<DirectMessage['registration']['id'], boolean>> = {};
  const roomsByVersion: Record<VersionAnnouncement['id'], Record<RoomAnnouncement['id'], boolean>> = {};
  res.registrations.forEach((reg) => {
    const r : Recipient = {
      type: MessageType.Direct,
      id: reg.id,
      name: reg.user.displayName,
      nuid: reg.user.nuid,
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
  const anyPins = res.registrations.some((r) => (r.currentPin ?? '') !== '');
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
          id: res.id,
          // This toString is needed because otherwise some CSS
          // mangler tries to convert this value directly to a string
          // to be used as a key, and then we get duplicate keys
          // since they're all [object Object]
          toString: () => res.id,
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
  const items: NavbarItem[] = useMemo(() => (
    course
      ? [
        [`/courses/${course.id}`, course.title],
        [`/exams/${res.id}/admin`, res.name],
        [undefined, 'Proctoring'],
      ]
      : [
        [undefined, res.name],
        [undefined, 'Proctoring'],
      ]), [course?.id, course?.title, res.id, res.name]);
  const curUnread = useRef({ anomalies: 15, messages: 3 });
  const initialFavicon = useMemo(() => (document.getElementById('favicon') as HTMLLinkElement)?.href, []);
  const renderBubble = useCallback(
    (
      message: number,
      fillColor: string,
      textColor: string,
      _initial: string,
      previous?: CanvasRenderingContext2D,
      previousFrame?: CanvasRenderingContext2D,
    ) => {
      const canvas = (previous ?? previousFrame)?.canvas ?? document.createElement('canvas');
      renderUnreads(canvas, previous, message, fillColor, textColor);
      return canvas.toDataURL();
    },
    [curUnread],
  );
  const renderUnreadCounts = useCallback(
    (
      initial: string,
      previous?: CanvasRenderingContext2D,
      previousFrame?: CanvasRenderingContext2D,
    ) => ((curUnread.current.messages > 0)
      ? renderBubble(curUnread.current.messages, 'cyan', 'black', initial, previous, previousFrame)
      : null),
    [curUnread, renderBubble],
  );
  const renderAnomalyCounts = useCallback(
    (
      initial: string,
      previous?: CanvasRenderingContext2D,
      previousFrame?: CanvasRenderingContext2D,
    ) => ((curUnread.current.anomalies)
      ? renderBubble(curUnread.current.anomalies, 'red', 'white', initial, previous, previousFrame)
      : null),
    [curUnread, renderBubble],
  );
  const setUnreadMessageCount = useCallback((messages: number) => {
    curUnread.current.messages = messages;
  }, [curUnread]);
  const setAnomalyCount = useCallback((anomalies: number) => {
    curUnread.current.anomalies = anomalies;
  }, [curUnread]);
  return (
    <>
      <RegularNavbar className="row" />
      <FaviconRotation
        options={[initialFavicon, renderAnomalyCounts, renderUnreadCounts]}
        animated={curUnread.current.anomalies > 0 || curUnread.current.messages > 0}
        animationDelay={1000}
      />
      <NavbarBreadcrumbs items={items} />
      <Row>
        <Col>
          <h1>
            {res.name}
            <ShowCurrentPins
              enabled={anyPins}
              recipients={recipients}
              recipientOptions={recipientOptions}
              exam={res}
            />
          </h1>
        </Col>
      </Row>
      <div className="content-wrapper">
        <div className="content h-100">
          <SplitViewLoaded
            exam={res}
            recipients={recipients}
            recipientOptions={recipientOptions}
            updateUnreadCount={setUnreadMessageCount}
            updateAnomalyCount={setAnomalyCount}
          />
        </div>
      </div>
    </>
  );
};

const renderUnreads = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  count: number,
  fillColor: string,
  textColor: string,
) => {
  // Create a rounded square taking 1/4 of the icon size;
  const radius = canvas.width / 8;

  drawString(
    `${count}`,
    fillColor,
    textColor,
    0,
    0,
    canvas.width,
    canvas.height,
    radius,
    canvas,
    canvas.getContext('2d'),
  );
};

const drawString = (
  message: string,
  fillColor: string,
  textColor: string,
  left: number,
  top: number,
  right: number,
  bottom: number,
  radius: number,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
) => {
  context.fillStyle = fillColor;
  context.strokeStyle = fillColor;
  context.lineWidth = 1;

  context.beginPath();
  context.moveTo(left + radius, top);
  context.quadraticCurveTo(left, top, left, top + radius);
  context.lineTo(left, bottom - radius);
  context.quadraticCurveTo(left, bottom, left + radius, bottom);
  context.lineTo(right - radius, bottom);
  context.quadraticCurveTo(right, bottom, right, bottom - radius);
  context.lineTo(right, top + radius);
  context.quadraticCurveTo(right, top, right - radius, top);
  context.closePath();
  context.fill();

  // Make the text size dynamic depending on the icon size
  // Useful to avoid shrinking on bigger high res icons
  context.font = `bold ${canvas.width / 1.25}px arial`;
  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(message, left + canvas.width / 2, top + canvas.height / 2);
};

const ExamProctoringQuery: React.FC = () => {
  const {
    examId,
  } = useParams<{ examId: string }>();
  const role = useLazyLoadQuery<examsProctorRoleQuery>(
    graphql`
    query examsProctorRoleQuery($examId: ID!) {
      me { role(examId: $examId) }
    }`,
    { examId },
  );
  const data = useLazyLoadQuery<examsProctorQuery>(
    graphql`
    query examsProctorQuery($examId: ID!, $skipCourse: Boolean!) {
      exam(id: $examId) {
        ...exams_proctoring
        course @skip(if: $skipCourse) { id title }
        name
        id
      }
    }
    `,
    { examId, skipCourse: role.me.role !== 'PROFESSOR' },
  );
  return (
    <DocumentTitle title={`${data.exam.name} - Proctoring`}>
      <Container fluid>
        <div className="wrapper vh-100">
          <div className="inner-wrapper">
            <ProctoringRecipients exam={data.exam} course={data.exam.course} />
          </div>
        </div>
      </Container>
    </DocumentTitle>
  );
};

export default ExamProctoring;
