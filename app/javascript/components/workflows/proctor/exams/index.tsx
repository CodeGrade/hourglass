import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  useResponse as examsShow,
} from '@hourglass/common/api/professor/exams/show';
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
  Card,
  Media,
} from 'react-bootstrap';
import ReadableDate from '@hourglass/common/ReadableDate';
import {
  FaThumbsUp,
  FaThumbsDown,
  FaInbox,
  FaList,
  FaCheck,
} from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import { MdMessage, MdSend, MdPeople } from 'react-icons/md';
import { Anomaly, useResponse as anomaliesIndex } from '@hourglass/common/api/proctor/anomalies';
import { destroyAnomaly } from '@hourglass/common/api/proctor/anomalies/destroy';
import Loading from '@hourglass/common/loading';
import { finalizeRegistration } from '@hourglass/common/api/proctor/registrations/finalize';
import { AlertContext } from '@hourglass/common/alerts';
import TooltipButton from '@hourglass/workflows/student/exams/show/components/TooltipButton';
import { useRefresher, ExhaustiveSwitchError } from '@hourglass/common/helpers';
import {
  RoomAnnouncement,
  DirectMessage,
  Response,
  useResponse as useExamMessages,
  Question,
  VersionAnnouncement,
  ExamAnnouncement,
  Message,
  MessageType,
  Recipient,
} from '@hourglass/common/api/proctor/messages';
import { GiBugleCall } from 'react-icons/gi';
import { DateTime } from 'luxon';
import { IconType } from 'react-icons';
import { sendMessage } from '@hourglass/common/api/proctor/messages/create';
import './index.scss';

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
    <Media as="li">
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
  regId: number;
  regFinal: boolean;
  refresh: () => void;
}> = (props) => {
  const {
    regId,
    regFinal,
    refresh,
  } = props;
  const { alert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const disabled = loading || regFinal;
  const reason = loading ? 'Loading...' : 'Already final';
  return (
    <Loading loading={loading}>
      <TooltipButton
        disabled={disabled}
        disabledMessage={reason}
        variant="danger"
        onClick={() => {
          setLoading(true);
          finalizeRegistration(regId).then((res) => {
            if (res.success === true) {
              alert({
                variant: 'success',
                message: 'Registration finalized.',
              });
              setLoading(false);
              refresh();
            } else {
              throw new Error(res.reason);
            }
          }).catch((err) => {
            alert({
              variant: 'danger',
              title: 'Error finalizing registration',
              message: err.message,
            });
            setLoading(false);
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
  refresh: () => void;
}> = (props) => {
  const {
    anomalyId,
    refresh,
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
              refresh();
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

const ShowAnomalies: React.FC<{
  anomalies: Anomaly[];
  refresh: () => void;
}> = (props) => {
  const {
    anomalies,
    refresh,
  } = props;
  useEffect(() => {
    const timer = setInterval(refresh, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [refresh]);
  return (
    <tbody>
      {anomalies.length === 0 && <tr><td colSpan={4}>No anomalies.</td></tr>}
      {anomalies.map((a) => (
        <tr key={a.id}>
          <td>{a.reg.displayName}</td>
          <td><ReadableDate showTime value={a.time} /></td>
          <td>{a.reason}</td>
          <td>
            <FinalizeButton refresh={refresh} regId={a.reg.id} regFinal={a.reg.final} />
            <ClearButton refresh={refresh} anomalyId={a.id} />
            <Button variant="info">
              <Icon I={MdMessage} />
              Message student
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

const ExamAnomalies: React.FC<{
  examId: number;
}> = (props) => {
  const {
    examId,
  } = props;
  const [refresher, refresh] = useRefresher();
  const res = anomaliesIndex(examId, [refresher]);
  switch (res.type) {
    case 'LOADING':
      return <p>Loading...</p>;
    case 'ERROR':
      return (
        <span className="text-danger">
          <p>Error</p>
          <small>{`${res.text} (${res.status})`}</small>
        </span>
      );
    case 'RESULT':
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
                  {res.type === 'RESULT' && <ShowAnomalies refresh={refresh} anomalies={res.response.anomalies} />}
                </Table>
              </div>
            </div>
          </div>
        </div>
      );
    default:
      throw new ExhaustiveSwitchError(res);
  }
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
    <Readable>
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
    </Readable>
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

const Readable: React.FC = (props) => {
  const { children } = props;
  const [read, setRead] = useState(false);
  return (
    <Card
      border="warning"
      className={read && 'border-0'}
    >
      <div>
        {children}
        <span
          className={`${read ? 'd-none' : ''} float-right align-self-center`}
        >
          <Button
            variant="warning"
            onClick={() => setRead(true)}
          >
            <Icon I={FaCheck} />
            Mark as read
          </Button>
        </span>
      </div>
    </Card>
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
          {all.map((m) => (
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

const Loaded: React.FC<{
  refresh: () => void;
  response: Response;
}> = (props) => {
  const {
    refresh,
    response,
  } = props;
  const {
    sent,
    questions,
    version,
    room,
    exam,
    recipients,
  } = response;
  useEffect(() => {
    const timer = setInterval(refresh, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [refresh]);
  const { alert } = useContext(AlertContext);
  const messageRef = useRef<HTMLTextAreaElement>();
  const [tabName, setTabName] = useState<MessagesTab>(MessagesTab.Timeline);
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
              refresh={refresh}
              messageRef={messageRef}
            />
          </div>
        </div>
      </div>
    </Tab.Container>
  );
};

const ExamMessages: React.FC<{
  examId: number;
}> = (props) => {
  const {
    examId,
  } = props;
  const [refresher, refresh] = useRefresher();
  const res = useExamMessages(examId, [refresher]);
  switch (res.type) {
    case 'LOADING':
      return <Loading loading />;
    case 'ERROR':
      return (
        <div className="text-danger">
          <p>Error</p>
          <small>{res.text}</small>
        </div>
      );
    case 'RESULT':
      return <Loaded refresh={refresh} response={res.response} />;
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

interface MessageFilterOption {
  value: Recipient;
  label: string;
}

const SendMessageButton: React.FC<{
  recipient: Recipient;
  message: string;
  refresh: () => void;
  onSuccess: () => void;
}> = (props) => {
  const {
    recipient,
    message,
    refresh,
    onSuccess,
  } = props;
  const { examId } = useParams();
  const { alert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const disabled = message === '' || loading;
  const disabledMessage = loading ? 'Loading...' : 'Enter a message to send';
  return (
    <Loading loading={loading}>
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
              refresh();
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
  refresh: () => void;
  messageRef: React.Ref<HTMLTextAreaElement>;
}> = (props) => {
  const {
    selectedRecipient,
    setSelectedRecipient,
    recipientOptions,
    refresh,
    messageRef,
  } = props;
  const [message, setMessage] = useState('');
  const resetVals = useCallback(() => {
    setMessage('');
  }, []);
  const groupStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };
  const formatGroupLabel = (data) => {
    if (data.options.length > 1) {
      return (
        <div style={groupStyles}>
          <span>{data.label}</span>
        </div>
      );
    }
    return <span />;
  };
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
          refresh={refresh}
          recipient={selectedRecipient.value}
          message={message}
        />
      </Form.Group>
    </>
  );
};

const ExamProctoring: React.FC = () => {
  const {
    examId,
  } = useParams();
  const res = examsShow(examId);
  return (
    <Container fluid>
      <div className="wrapper vh-100">
        <div className="inner-wrapper">
          <RegularNavbar className="row" />
          <Row>
            <Col>
              <Loading loading={res.type !== 'RESULT'}>
                <h1>{res.type === 'RESULT' ? res.response.name : 'Exam'}</h1>
              </Loading>
            </Col>
          </Row>
          <div className="content-wrapper">
            <div className="content h-100">
              <Row className="h-100">
                <Col sm={6}>
                  <ExamAnomalies examId={examId} />
                </Col>
                <Col sm={6}>
                  <ExamMessages examId={examId} />
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ExamProctoring;