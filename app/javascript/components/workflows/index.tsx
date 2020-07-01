import { hot } from 'react-hot-loader';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { useContext, useState, useEffect } from 'react';
import { RailsContext } from '@student/exams/show/context';
import RegularNavbar from '@hourglass/common/navbar';
import { Container, Modal, Button } from 'react-bootstrap';
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  useParams,
  Prompt,
} from 'react-router-dom';
import * as ApiStudentExamsShow from '@hourglass/common/api/student/exams/show';
import * as ApiStudentReg from '@hourglass/common/api/student/registrations';
import * as ApiProfessorCourses from '@hourglass/common/api/professor/courses';
import ShowExam from '@student/exams/show';
import ShowCourse from '@professor/courses/show';
import ExamAdmin from '@professor/exams/admin';
import ExamSubmissions from '@professor/exams/submissions';
import ExamProctoring from '@proctor/exams/index';
import EditExamVersion from '@professor/exams/edit';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { AllAlerts } from '@hourglass/common/alerts';
import './index.scss';
import ErrorBoundary from '@hourglass/common/boundary';
import DocumentTitle from '@hourglass/common/documentTitle';

import { RelayEnvironmentProvider } from 'relay-hooks';
import environment from '@hourglass/relay/environment';

interface StudentRegsProps {
  regs: ApiStudentReg.Reg[];
  regInfo: ApiStudentReg.RegInfo;
}

const StudentRegs: React.FC<StudentRegsProps> = (props) => {
  const {
    regs,
    regInfo,
  } = props;
  if (regs.length === 0) return null;
  return (
    <>
      <h1>Take an Exam</h1>
      <ul>
        {regs.map((reg) => {
          const { exam } = regInfo[reg.id];
          return (
            <li
              key={reg.id}
            >
              <Link
                to={`/exams/${exam.id}`}
              >
                {exam.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
};

interface ProfessorCoursesProps {
  courses: ApiProfessorCourses.Course[];
}

const ProfessorRegs: React.FC<ProfessorCoursesProps> = (props) => {
  const {
    courses,
  } = props;
  if (courses.length === 0) return null;
  return (
    <>
      <h1>Courses</h1>
      <ul>
        {courses.map((c) => (
          <li
            key={c.id}
          >
            <Link
              to={`/courses/${c.id}`}
            >
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

const Exams: React.FC = () => {
  const studentResponse = ApiStudentReg.useResponse();
  const profResponse = ApiProfessorCourses.useResponse();
  const bothLoading = studentResponse.type === 'LOADING' && profResponse.type === 'LOADING';
  const studentEmpty = studentResponse.type === 'RESULT' && studentResponse.response.regs.length === 0;
  const profEmpty = profResponse.type === 'RESULT' && profResponse.response.courses.length === 0;
  const bothEmpty = studentEmpty && profEmpty;
  return (
    <div>
      {bothLoading && <p>Loading...</p>}
      {bothEmpty && <p>You have no registrations.</p>}
      {studentResponse.type === 'RESULT' && (
        <StudentRegs
          regs={studentResponse.response.regs}
          regInfo={studentResponse.response.regInfo}
        />
      )}
      {profResponse.type === 'RESULT' && (
        <ProfessorRegs
          courses={profResponse.response.courses}
        />
      )}
    </div>
  );
};

const Exam: React.FC = () => {
  const { examId } = useParams();
  const { railsUser } = useContext(RailsContext);
  const showRes = ApiStudentExamsShow.useResponse(examId);
  switch (showRes.type) {
    case 'ERROR':
      return (
        <>
          <RegularNavbar />
          <Container>
            <span className="text-danger">{showRes.text}</span>
          </Container>
        </>
      );
    case 'LOADING':
      return (
        <>
          <RegularNavbar />
          <Container>
            <p>Loading...</p>
          </Container>
        </>
      );
    case 'RESULT':
      return (
        <DocumentTitle title={showRes.response.railsExam.name}>
          <ShowExam
            railsUser={railsUser}
            railsExam={showRes.response.railsExam}
            railsCourse={showRes.response.railsCourse}
            railsRegistration={showRes.response.railsRegistration}
            final={showRes.response.final}
            lastSnapshot={showRes.response.lastSnapshot}
          />
        </DocumentTitle>
      );
    default:
      throw new ExhaustiveSwitchError(showRes);
  }
};

type CustomHandler = (b: boolean) => void;

interface BlockerContext {
  setCustomHandler: (f: () => CustomHandler) => void;
}

const BlockerContext = React.createContext({} as BlockerContext);

export const BlockNav: React.FC<{
  when?: boolean;
  message: string;
  onStay?: () => void;
  onLeave?: () => void;
}> = (props) => {
  const {
    when = true,
    message,
    onStay,
    onLeave,
  } = props;
  const { setCustomHandler } = useContext(BlockerContext);
  useEffect(() => {
    setCustomHandler(() => (b) => {
      if (b && onLeave) onLeave();
      if (!b) {
        if (onStay) onStay();
        window.history.pushState({}, document.title);
      }
    });
  }, [onStay, onLeave]);
  return (
    <Prompt
      when={when}
      message={message}
    />
  );
};

const Entry: React.FC = () => {
  const railsUser = undefined; // TODO: remove

  const [transitioning, setTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [transitionCallback, setTransitionCallback] = useState(() => (_) => undefined);
  const [customHandler, setCustomHandler] = useState<CustomHandler>(() => (_) => undefined);
  return (
    <RelayEnvironmentProvider environment={environment}>
      <RailsContext.Provider
        value={{
          railsUser,
        }}
      >
        <BlockerContext.Provider
          value={{
            setCustomHandler,
          }}
        >
          <DndProvider backend={HTML5Backend}>
            <BrowserRouter
              getUserConfirmation={(message, callback) => {
                setTransitioning(true);
                setTransitionMessage(message);
                setTransitionCallback(() => callback);
              }}
            >
              <Modal
                show={transitioning}
                onHide={() => {
                  setTransitioning(false);
                  transitionCallback(false);
                  customHandler(false);
                }}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Are you sure you want to navigate?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {transitionMessage}
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setTransitioning(false);
                      transitionCallback(false);
                      customHandler(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setTransitioning(false);
                      transitionCallback(true);
                      customHandler(true);
                    }}
                  >
                    Leave
                  </Button>
                </Modal.Footer>
              </Modal>
              <Switch>
                <Route path="/exams/:examId" exact>
                  <Exam />
                </Route>
                <Route path="/exams/:examId/proctoring">
                  <AllAlerts>
                    <ExamProctoring />
                  </AllAlerts>
                </Route>
                <Route path="/">
                  <RegularNavbar />
                  <Container>
                    <ErrorBoundary>
                      <AllAlerts>
                        <Switch>
                          <Route exact path="/">
                            <DocumentTitle title="My Exams">
                              <Exams />
                            </DocumentTitle>
                          </Route>
                          <Route path="/exams/:examId/admin">
                            <ExamAdmin />
                          </Route>
                          <Route path="/exams/:examId/submissions">
                            <ExamSubmissions />
                          </Route>
                          <Route path="/exams/:examId/versions/:versionId/edit" exact>
                            <EditExamVersion />
                          </Route>
                          <Route path="/courses/:courseId">
                            <ShowCourse />
                          </Route>
                          <Route path="*">
                            <DocumentTitle title="Not found">
                              TODO: 404!
                            </DocumentTitle>
                          </Route>
                        </Switch>
                      </AllAlerts>
                    </ErrorBoundary>
                  </Container>
                </Route>
              </Switch>
            </BrowserRouter>
          </DndProvider>
        </BlockerContext.Provider>
      </RailsContext.Provider>
    </RelayEnvironmentProvider>
  );
};

// ts-prune-ignore-next
export default hot(module)(Entry);
