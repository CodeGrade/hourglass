import React, { useState, useContext, useEffect } from 'react';
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
  useResponse as useExamMessages,
  Question,
  VersionAnnouncement,
  ExamAnnouncement,
  Message,
  MessageType,
} from '@hourglass/common/api/proctor/messages';
import { GiBugleCall } from 'react-icons/gi';
import { DateTime } from 'luxon';
import { IconType } from 'react-icons';


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
      {anomalies.length === 0 && <tr><td>No anomalies.</td></tr>}
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
  return (
    <>
      <h2>Anomalies</h2>
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
      {res.type === 'LOADING' && <p>Loading...</p>}
      {res.type === 'ERROR' && (
        <span className="text-danger">
          <p>Error</p>
          <small>{`${res.text} (${res.status})`}</small>
        </span>
      )}
    </>
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
}> = (props) => {
  const {
    question,
  } = props;
  const {
    sender,
    body,
    time,
  } = question;
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
          <Button variant="info">
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
}> = (props) => {
  const {
    message,
  } = props;
  switch (message.type) {
    case MessageType.Direct:
      return <ShowDirectMessage message={message} />;
    case MessageType.Question:
      return <ShowQuestion question={message} />;
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
  examId: number;
  receivedOnly?: boolean;
  sentOnly?: boolean;
}> = (props) => {
  const {
    examId,
    receivedOnly = false,
    sentOnly = false,
  } = props;
  const res = useExamMessages(examId);
  if (res.type === 'LOADING') {
    return <Loading loading />;
  }
  if (res.type === 'ERROR') {
    return (
      <div className="text-danger">
        <p>Error</p>
        <small>{res.text}</small>
      </div>
    );
  }
  const {
    questions,
    sent,
    version,
    room,
    exam,
  } = res.response;
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
  all.sort((a, b) => b.time.diff(a.time).milliseconds);
  return (
    <>
      {all.map((m) => (
        <SingleMessage key={m.id} message={m} />
      ))}
    </>
  );
};

const MessagesTimeline: React.FC<{
  examId: number;
  receivedOnly?: boolean;
  sentOnly?: boolean;
}> = (props) => {
  const {
    examId,
    receivedOnly,
    sentOnly,
  } = props;
  return (
    <>
      <div>
        Filter by:
        <Select
          placeholder="Choose selection criteria..."
          options={[
            { value: 'all', label: 'anyone' },
            { value: 'Room 1', label: 'Room 1' },
            { value: 'Room 2', label: 'Room 2' },
            { value: 'Version 1', label: 'Version A' },
            { value: 'Version 2', label: 'Version B' },
            { value: 'studentX', label: 'Student X' },
          ]}
        />
      </div>
      <p>
        There should be one option per room,
        one option per exam version, and
        one option per student who has sent or received a message
      </p>
      <p>
        (reply fills in the recipient below, and sets
        focus to the message sender)
      </p>
      <ShowMessages receivedOnly={receivedOnly} sentOnly={sentOnly} examId={examId} />
    </>
  );
};

enum MessagesTab {
  Timeline = 'timeline',
  Received = 'received',
  Sent = 'sent',
}

const ExamMessages: React.FC<{
  examId: number;
}> = (props) => {
  const {
    examId,
  } = props;
  const [tabName, setTabName] = useState<MessagesTab>(MessagesTab.Timeline);
  return (
    <>
      <h2>Messages</h2>
      <Tab.Container activeKey={tabName}>
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
        <Tab.Content className="border border-top-0 rounded-bottom p-3">
          <Tab.Pane eventKey={MessagesTab.Timeline} className="overflow-scroll-y">
            <MessagesTimeline examId={examId} />
          </Tab.Pane>
          <Tab.Pane eventKey={MessagesTab.Received}>
            <MessagesTimeline receivedOnly examId={examId} />
          </Tab.Pane>
          <Tab.Pane eventKey={MessagesTab.Sent}>
            <MessagesTimeline sentOnly examId={examId} />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </>
  );
};

const ExamProctoring: React.FC = () => {
  const {
    examId,
  } = useParams();
  const res = examsShow(examId);
  return (
    <>
      <RegularNavbar />
      <Container fluid className="mh-100 flex-column">
        <Row>
          <Col>
            <Loading loading={res.type !== 'RESULT'}>
              <h1>{res.type === 'RESULT' ? res.response.name : 'Exam'}</h1>
            </Loading>
          </Col>
        </Row>
        <Row className="flex-grow-1">
          <Col sm={6}>
            <ExamAnomalies examId={examId} />
          </Col>
          <Col sm={6} className="d-flex flex-column">
            <div className="flex-grow-1">
              <ExamMessages examId={examId} />
            </div>
            <div>
              <h2>Send message</h2>
              <Form.Group as={Row}>
                <Form.Label>To:</Form.Label>
                <span>
                  select box that you can type in, with options for
                  student names, version names, and room names, or everyone
                </span>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label>Message:</Form.Label>
                <textarea />
              </Form.Group>
              <Button variant="success">
                <Icon I={MdSend} />
                Send
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ExamProctoring;
