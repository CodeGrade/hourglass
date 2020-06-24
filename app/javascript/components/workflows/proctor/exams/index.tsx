import React, { useState, useContext, useEffect } from 'react';
import {
  useResponse as examsShow,
} from '@hourglass/common/api/professor/exams/show';
import RegularNavbar from '@hourglass/common/navbar';
import Select from 'react-select';
import { DateTime } from 'luxon';
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
import { Anomaly, useResponse as anomaliesIndex } from '@hourglass/common/api/proctor/anomalies';
import { destroyAnomaly } from '@hourglass/common/api/proctor/anomalies/destroy';
import Loading from '@hourglass/common/loading';
import { finalizeRegistration } from '@hourglass/common/api/proctor/registrations/finalize';
import { AlertContext } from '@hourglass/common/alerts';
import TooltipButton from '@hourglass/workflows/student/exams/show/components/TooltipButton';
import { useRefresher } from '@hourglass/common/helpers';

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
  }, [refresh])
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

enum ProctoringTab {
  Timeline = 'timeline',
  Received = 'received',
  Sent = 'sent',
}

const ExamProctoring: React.FC = () => {
  const {
    examId,
  } = useParams();
  const [tabName, setTabName] = useState<ProctoringTab>(ProctoringTab.Timeline);
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
              <h2>Messages</h2>
              <Tab.Container activeKey={tabName}>
                <Nav
                  variant="tabs"
                  activeKey={tabName}
                  onSelect={(key) => setTabName(key)}
                >
                  <Nav.Item>
                    <Nav.Link
                      eventKey={ProctoringTab.Timeline}
                    >
                      <Icon I={FaList} />
                      <span className="ml-2">
                        Timeline
                      </span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey={ProctoringTab.Received}
                    >
                      <Icon I={FaInbox} />
                      <span className="ml-2">
                        Received
                      </span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey={ProctoringTab.Sent}
                    >
                      <Icon I={MdSend} />
                      <span className="ml-2">
                        Sent
                      </span>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content className="border border-top-0 rounded-bottom p-3">
                  <Tab.Pane eventKey={ProctoringTab.Timeline} className="overflow-scroll-y">
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
                  <Tab.Pane eventKey={ProctoringTab.Received}>
                    Ditto, but only received messages
                  </Tab.Pane>
                  <Tab.Pane eventKey={ProctoringTab.Sent}>
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
    </>
  );
};

export default ExamProctoring;
