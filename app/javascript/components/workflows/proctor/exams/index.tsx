import React from 'react';
import {
  useResponse as examsShow,
} from '@hourglass/common/api/professor/exams/show';
import RegularNavbar from '@hourglass/common/navbar';
import Select from 'react-select';
import { DateTime } from 'luxon';
import { useParams } from 'react-router-dom';
import { useRefresher, ExhaustiveSwitchError } from '@hourglass/common/helpers';
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
import { ShowMessage } from '@hourglass/workflows/student/exams/show/components/navbar/ExamMessages';
import { GiBugleCall } from 'react-icons/gi';
import { Anomaly, useResponse as anomaliesIndex } from '@hourglass/common/api/professor/exams/anomalies';

const ShowAnomalies: React.FC<{
  anomalies: Anomaly[];
}> = (props) => {
  const {
    anomalies,
  } = props;
  return (
    <tbody>
      {anomalies.length === 0 && <p>No anomalies.</p>}
      {anomalies.map((a) => (
        <tr key={a.id}>
          <td>{a.reg.displayName}</td>
          <td><ReadableDate showTime value={a.time} /></td>
          <td>{a.reason}</td>
          <td>
            <Button variant="danger">
              <Icon I={FaThumbsDown} />
              Finalize
            </Button>
            <Button variant="success">
              <Icon I={FaThumbsUp} />
              Clear anomaly
            </Button>
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
  const res = anomaliesIndex(examId);
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
        {res.type === 'LOADING' && <p>Loading...</p>}
        {res.type === 'ERROR' && (
          <span className="text-danger">
            <p>Error</p>
            <small>{`${res.text} (${res.status})`}</small>
          </span>
        )}
        {res.type === 'RESULT' && <ShowAnomalies anomalies={res.response.anomalies} />}
      </Table>
    </>
  );
};

interface ProctorExamProps {
  name: string;
  examId: number;
}

const ProctorExam: React.FC<ProctorExamProps> = (props) => {
  const { name } = props;
  const {
    examId,
  } = useParams();
  const tabName = 'timeline';
  return (
    <Container fluid className="mh-100 flex-column">
      <RegularNavbar />
      <Row>
        <h1>{name}</h1>
      </Row>
      <Row className="flex-grow-1">
        <Col sm={6}>
          <ExamAnomalies examId={examId} />
        </Col>
        <Col sm={6} className="d-flex flex-column">
          <div className="flex-grow-1">
            <h2>Messages</h2>
            <Tab.Container activeKey={tabName}>
              <Nav
                variant="tabs"
                activeKey={tabName}
              >
                <Nav.Item>
                  <Nav.Link
                    eventKey="timeline"
                  >
                    <Icon I={FaList} />
                    <span className="ml-2">
                      Timeline
                    </span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="received"
                  >
                    <Icon I={FaInbox} />
                    <span className="ml-2">
                      Received
                    </span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="sent"
                  >
                    <Icon I={MdSend} />
                    <span className="ml-2">
                      Sent
                    </span>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content className="border border-top-0 rounded-bottom p-3">
                <Tab.Pane eventKey="timeline" className="overflow-scroll-y">
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
                  <ShowMessage
                    icon={MdPeople}
                    tooltip="Sent to Room 1"
                    body="Room broadcast"
                    time={DateTime.local()}
                  />
                  <ShowMessage
                    icon={GiBugleCall}
                    tooltip="Sent to everyone"
                    body="Message to everyone"
                    time={DateTime.local()}
                  />
                  <Card border="warning">
                    <ShowMessage
                      icon={MdMessage}
                      tooltip="Received from Student X"
                      body="Unread message from Student X"
                      time={DateTime.local()}
                    />
                    <p>
                      (reply fills in the recipient below, and sets
                      focus to the message sender)
                    </p>
                    <span className="ml-auto m-0">
                      <Button variant="info">
                        <Icon I={MdSend} />
                        Reply
                      </Button>
                      <Button variant="warning">
                        <Icon I={FaCheck} />
                        Mark as read
                      </Button>
                    </span>
                  </Card>
                  <div className="d-flex justify-content-between">
                    <ShowMessage
                      icon={MdMessage}
                      tooltip="Received from Student Y"
                      body="Read message from Student Y"
                      time={DateTime.local()}
                    />
                    <span className="align-self-center mr-2">
                      <Button variant="info">
                        <Icon I={MdSend} />
                        Reply
                      </Button>
                    </span>
                  </div>
                  <ShowMessage
                    icon={MdSend}
                    tooltip="Sent to Student X"
                    body="Message to Student X"
                    time={DateTime.local()}
                  />
                </Tab.Pane>
                <Tab.Pane eventKey="received">
                  Ditto, but only received messages
                </Tab.Pane>
                <Tab.Pane eventKey="sent">
                  Ditto, but only sent messages
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
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
  );
};

const ExamProctoring: React.FC = () => {
  const { examId } = useParams();
  const [refresher] = useRefresher();
  const res = examsShow(examId, [refresher]);
  switch (res.type) {
    case 'ERROR':
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return <ProctorExam examId={examId} name={res.response.name} />;
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

export default ExamProctoring;
