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
import { destroyAnomaly } from '@hourglass/common/api/proctor/anomalies/destroy';
import Loading from '@hourglass/common/loading';
import { AlertContext } from '@hourglass/common/alerts';
import TooltipButton from '@hourglass/workflows/student/exams/show/components/TooltipButton';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import {
  Recipient,
  SplitRecipients,
} from '@hourglass/common/api/proctor/messages/recipients';
import { GiBugleCall } from 'react-icons/gi';
import { DateTime } from 'luxon';
import { IconType } from 'react-icons';
import { sendMessage } from '@hourglass/common/api/proctor/messages/create';
import './index.scss';
import { BsListCheck } from 'react-icons/bs';
import { doFinalize } from '@hourglass/common/api/proctor/exams/finalize';
import { NewMessages, PreviousMessages } from '@hourglass/common/messages';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '@hourglass/relay/environment';

import DocumentTitle from '@hourglass/common/documentTitle';
import { useFragment, useMutation, useSubscription } from 'relay-hooks';

import { examsProctorQuery } from './__generated__/examsProctorQuery.graphql';
import { exams_recipients$key } from './__generated__/exams_recipients.graphql';

import { exams_anomalies$key } from './__generated__/exams_anomalies.graphql';

enum MessageType {
  Direct = 'DIRECT',
  Question = 'QUESTION',
  Room = 'ROOM',
  Version = 'VERSION',
  Exam = 'EXAM',
}

interface DirectMessage {
  type: MessageType.Direct;
  time: DateTime;
  id: number;
  body: string;
  sender: {
    isMe: boolean;
    displayName: string;
  };
  recipient: {
    displayName: string;
  };
}

interface Question {
  type: MessageType.Question;
  time: DateTime;
  id: number;
  body: string;
  sender: {
    id: number;
    displayName: string;
  };
}

interface VersionAnnouncement {
  type: MessageType.Version;
  time: DateTime;
  id: number;
  version: {
    name: string;
  };
  body: string;
}

interface RoomAnnouncement {
  type: MessageType.Room;
  time: DateTime;
  id: number;
  room: {
    name: string;
  };
  body: string;
}

interface ExamAnnouncement {
  type: MessageType.Exam;
  id: number;
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
        </p>
        <p>{body}</p>
      </Media.Body>
    </Media>
  );
};


const FinalizeButton: React.FC<{
  registrationId: string;
  regFinal: boolean;
}> = (props) => {
  const {
    registrationId,
    regFinal,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation(
    graphql`
      mutation examsFinalizeRegistrationMutation($input: FinalizeRegistrationInput!) {
        finalizeRegistration(input: $input) {
          registration {
            final
          }
        }
      }
    `,
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
                registrationId,
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
  anomalyId: number;
}> = (props) => {
  const {
    anomalyId,
  } = props;
  const { alert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  return (
    <Loading loading={loading}>
      <TooltipButton
        disabled={loading}
        disabledMessage="Loading..."
        variant="success"
        onClick={() => {
          setLoading(true);
          destroyAnomaly(anomalyId).then((res) => {
            if (res.success === true) {
              alert({
                variant: 'success',
                message: 'Anomaly cleared.',
                autohide: true,
              });
              setLoading(false);
            } else {
              throw new Error(res.reason);
            }
          }).catch((err) => {
            alert({
              variant: 'danger',
              title: 'Error clearing anomaly',
              message: err.message,
            });
            setLoading(false);
          });
        }}
      >
        <Icon I={FaThumbsUp} />
        Clear anomaly
      </TooltipButton>
    </Loading>
  );
};

const newAnomalySubscriptionSpec = graphql`
  subscription examsNewAnomalySubscription($examRailsId: Int!) {
    anomalyWasCreated(examRailsId: $examRailsId) {
      ...exams_anomalies
    }
  }
`;

const ShowAnomalies: React.FC<{
  replyTo: (userId: number) => void;
  exam: exams_anomalies$key;
}> = (props) => {
  const {
    replyTo,
    exam,
  } = props;
  const res = useFragment(
    graphql`
      fragment exams_anomalies on Exam {
        id
        railsId
        anomalies {
          id
          railsId
          createdAt
          reason
          registration {
            id
            railsId
            final
            user {
              railsId
              displayName
            }
          }
        }
      }
    `,
    exam,
  );
  const subscriptionObject = useMemo(() => ({
    subscription: newAnomalySubscriptionSpec,
    variables: {
      examRailsId: res.railsId,
    },
  }), [res.railsId]);
  useSubscription(subscriptionObject);
  const { anomalies } = res;
  return (
    <>
      {anomalies.length === 0 && <tr><td colSpan={4}>No anomalies.</td></tr>}
      {anomalies.map((a) => (
        <tr key={a.id}>
          <td>{a.registration.user.displayName}</td>
          <td>
            <ReadableDate
              showTime
              value={DateTime.fromISO(a.createdAt)}
            />
          </td>
          <td>{a.reason}</td>
          <td>
            <FinalizeButton
              registrationId={a.registration.id}
              regFinal={a.registration.final}
            />
            <ClearButton anomalyId={a.railsId} />
            <Button
              variant="info"
              onClick={() => {
                replyTo(a.registration.user.railsId);
              }}
            >
              <Icon I={MdMessage} />
              Message student
            </Button>
          </td>
        </tr>
      ))}
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
  examId: number;
  recipientOptions: RecipientOptions;
}> = (props) => {
  const {
    examId,
    recipientOptions,
  } = props;
  const { alert } = useContext(AlertContext);
  const [selectedRecipient, setSelectedRecipient] = useState<MessageFilterOption>(
    recipientOptions[0].options[0],
  );
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
  const finalize = () => {
    setLoading(true);
    let type;
    switch (selectedRecipient.value.type) {
      case MessageType.Exam:
        type = 'EXAM';
        break;
      case MessageType.Room:
        type = 'ROOM';
        break;
      case MessageType.Direct:
        type = 'USER';
        break;
      case MessageType.Version:
        type = 'VERSION';
        break;
      default:
        throw new ExhaustiveSwitchError(selectedRecipient.value.type);
    }
    doFinalize(examId, {
      type,
      id: selectedRecipient.value.id,
    }).then((res) => {
      if (res.success !== true) {
        throw new Error(res.reason);
      }
      closeModal();
      setLoading(false);
      alert({
        variant: 'success',
        autohide: true,
        title: 'Finalization successful',
        message: `Finalized '${selectedRecipient.label}'.`,
      });
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
      alert({
        variant: 'danger',
        title: `Error finalizing '${selectedRecipient.label}'`,
        message: err.message,
      });
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
  replyTo: (userId: number) => void;
  recipientOptions: RecipientOptions;
  examId: number;
  exam: exams_anomalies$key;
}> = (props) => {
  const {
    replyTo,
    recipientOptions,
    examId,
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
          <FinalizeRegs examId={examId} recipientOptions={recipientOptions} />
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
  replyTo: (userId: number) => void;
}> = (props) => {
  const {
    question,
    replyTo,
  } = props;
  const {
    sender,
    body,
    time,
  } = question;
  const reply = useCallback(() => replyTo(sender.id), [sender.id]);
  return (
    <div className="d-flex">
      <ShowMessage
        icon={MdMessage}
        tooltip={`Received from ${sender.displayName}`}
        body={body}
        time={time}
      />
      <div className="flex-grow-1" />
      <span className="align-self-center mr-2">
        <Button
          variant="info"
          onClick={reply}
        >
          <Icon I={MdSend} />
          Reply
        </Button>
      </span>
    </div>
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
    recipient,
    body,
    time,
  } = message;
  const senderName = `${sender.displayName}${sender.isMe ? ' (you)' : ''}`;
  return (
    <ShowMessage
      icon={MdSend}
      tooltip={`Sent by ${senderName} to ${recipient.displayName}`}
      body={body}
      time={time}
    />
  );
};

const SingleMessage: React.FC<{
  message: Message;
  replyTo: (userId: number) => void;
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

type FilterVals = { value: string; label: string; };

const ShowMessages: React.FC<{
  replyTo: (userId: number) => void;
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
        option = m.recipient.displayName;
        break;
      case MessageType.Question:
        option = m.sender.displayName;
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
          return m.recipient.displayName === filter.value;
        case MessageType.Question:
          return m.sender.displayName === filter.value;
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
        <div className="content overflow-auto-y">
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

const newMessageSubscriptionSpec = graphql`
  subscription examsNewMessageSubscription($examRailsId: Int!) {
    messageWasSent(examRailsId: $examRailsId) {
      ...exams_messages
    }
  }
`;

const Loaded: React.FC<{
  selectedRecipient: MessageFilterOption;
  setSelectedRecipient: (option: MessageFilterOption) => void;
  messageRef: React.Ref<HTMLTextAreaElement>;
  replyTo: (userId: number) => void;
  examId: number;
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
  const subscriptionObject = useMemo(() => ({
    subscription: newMessageSubscriptionSpec,
    variables: {
      examRailsId: examId,
    },
  }), [examId]);
  useSubscription(subscriptionObject);
  const [tabName, setTabName] = useState<MessagesTab>(MessagesTab.Timeline);

  return (
    <Tab.Container activeKey={tabName}>
      <div className="wrapper h-100">
        <div className="inner-wrapper">
          <h2>Messages</h2>
          <Nav
            variant="tabs"
            activeKey={tabName}
            onSelect={(key) => setTabName(key)}
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
  replyTo: (userId: number) => void;
  recipientOptions: RecipientOptions;
  exam: any;
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
        railsId
        versionAnnouncements {
          railsId
          id
          createdAt
          body
          examVersion {
            name
          }
        }
        roomAnnouncements {
          id
          railsId
          createdAt
          body
          room {
            name
          }
        }
        examAnnouncements {
          id
          railsId
          createdAt
          body
        }
        questions {
          railsId
          id
          createdAt
          sender {
            id
            railsId
            displayName
          }
          body
        }
        messages {
          railsId
          id
          body
          createdAt
          sender {
            isMe
            displayName
          }
          recipient {
            displayName
          }
        }
      }
    `,
    exam,
  );
  return (
    <Loaded
      examId={res.railsId}
      recipientOptions={recipientOptions}
      response={{
        sent: res.messages.map((msg) => ({
          type: MessageType.Direct,
          id: msg.railsId,
          body: msg.body,
          sender: msg.sender,
          recipient: msg.recipient,
          time: DateTime.fromISO(msg.createdAt),
        })),
        questions: res.questions.map((question) => ({
          type: MessageType.Question,
          id: question.railsId,
          body: question.body,
          sender: {
            id: question.sender.railsId,
            displayName: question.sender.displayName,
          },
          time: DateTime.fromISO(question.createdAt),
        })),
        version: res.versionAnnouncements.map((va) => ({
          type: MessageType.Version,
          id: va.railsId,
          body: va.body,
          version: va.examVersion,
          time: DateTime.fromISO(va.createdAt),
        })),
        exam: res.examAnnouncements.map((ea) => ({
          type: MessageType.Exam,
          id: ea.railsId,
          body: ea.body,
          time: DateTime.fromISO(ea.createdAt),
        })),
        room: res.roomAnnouncements.map((ra) => ({
          type: MessageType.Room,
          id: ra.railsId,
          body: ra.body,
          room: ra.room,
          time: DateTime.fromISO(ra.createdAt),
        })),
      }}
      selectedRecipient={selectedRecipient}
      setSelectedRecipient={setSelectedRecipient}
      messageRef={messageRef}
      replyTo={replyTo}
    />
  );
};

interface MessageFilterOption {
  value: Recipient;
  label: string;
}

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
  const { examId } = useParams();
  const { alert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
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
          setLoading(true);
          sendMessage(examId, recipient, message).then((res) => {
            if (res.success === true) {
              alert({
                variant: 'success',
                message: 'Message sent.',
                autohide: true,
              });
              setLoading(false);
              onSuccess();
            } else {
              throw new Error(res.reason);
            }
          }).catch((err) => {
            alert({
              variant: 'danger',
              title: 'Error sending message',
              message: err.message,
            });
            setLoading(false);
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
  exam: exam_anomalies$key;
  examId: number;
  recipients: SplitRecipients;
}> = (props) => {
  const {
    exam,
    examId,
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
          id: -1,
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
  const replyTo = (userId: number) => {
    const recip = recipientOptions[3].options.find((option) => option.value.id === userId);
    if (!recip) {
      alert({
        variant: 'danger',
        title: 'Error replying to message',
        message: `Invalid User ID: ${userId}`,
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
          examId={examId}
          replyTo={replyTo}
        />
      </Col>
      <Col sm={6}>
        <ExamMessages
          exam={exam}
          recipientOptions={recipientOptions}
          examId={examId}
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
  const { examId } = useParams();
  const {
    exam,
  } = props;
  const res = useFragment<exams_recipients$key>(
    graphql`
    fragment exams_recipients on Exam {
      examVersions { railsId name }
      students { railsId displayName }
      rooms { railsId name }
    }
    `,
    exam,
  );
  return (
    <SplitViewLoaded
      exam={exam}
      examId={examId}
      recipients={{
        versions: res.examVersions.map((ev) => ({
          type: MessageType.Version,
          id: ev.railsId,
          name: ev.name,
        })).sort((a, b) => a.name.localeCompare(b.name)),
        students: res.students.map((student) => ({
          type: MessageType.Direct,
          id: student.railsId,
          name: student.displayName,
        })).sort((a, b) => a.name.localeCompare(b.name)),
        rooms: res.rooms.map((room) => ({
          type: MessageType.Room,
          id: room.railsId,
          name: room.name,
        })).sort((a, b) => a.name.localeCompare(b.name)),
      }}
    />
  );
};

const ExamProctoring: React.FC = () => {
  const {
    examId,
  } = useParams();
  return (
    <QueryRenderer<examsProctorQuery>
      environment={environment}
      query={graphql`
        query examsProctorQuery($examRailsId: Int!) {
          exam(railsId: $examRailsId) {
            ...exams_recipients
            ...exams_anomalies
            ...exams_messages
            name
          }
        }
        `}
      variables={{
        examRailsId: Number(examId),
      }}
      render={({ error, props }) => {
        if (error) {
          return <p>Error</p>;
        }
        if (!props) {
          return <p>Loading...</p>;
        }
        return (
          <DocumentTitle title={`${props.exam.name} - Proctoring`}>
            <Container fluid>
              <div className="wrapper vh-100">
                <div className="inner-wrapper">
                  <RegularNavbar className="row" />
                  <Row>
                    <Col>
                      <h1>{props.exam.name}</h1>
                    </Col>
                  </Row>
                  <div className="content-wrapper">
                    <div className="content h-100">
                      <ProctoringSplitView exam={props.exam} />
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </DocumentTitle>
        );
      }}
    />
  );
};

export default ExamProctoring;
