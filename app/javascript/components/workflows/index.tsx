require('./wdyr');

import { hot } from 'react-hot-loader';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { useContext, useState, useEffect, useCallback } from 'react';
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
import * as ApiMe from '@hourglass/common/api/me';
import * as ApiStudentExamsShow from '@hourglass/common/api/student/exams/show';
import * as ApiStudentReg from '@hourglass/common/api/student/registrations';
import * as ApiProfessorCourses from '@hourglass/common/api/professor/courses';
import ShowExam from '@student/exams/show';
import ShowCourse from '@professor/courses/show';
import ExamAdmin from '@professor/exams/admin';
import EditExamVersion from '@professor/exams/edit';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import StudentDND from '@hourglass/common/student-dnd';
import { AllAlerts } from '@hourglass/common/alerts';
import AllocateVersions from '@professor/exams/allocate-versions';
import AssignStaff from '@professor/exams/assign-staff';
import './index.scss';

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
  return (
    <div>
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
        <ShowExam
          railsUser={railsUser}
          railsExam={showRes.response.railsExam}
          railsCourse={showRes.response.railsCourse}
          railsRegistration={showRes.response.railsRegistration}
          final={showRes.response.final}
          lastSnapshot={showRes.response.lastSnapshot}
        />
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

const Entry: React.FC = React.memo(() => {
  const res = ApiMe.useResponse();
  const railsUser = res.type === 'RESULT' ? res.response.user : undefined;

  const [transitioning, setTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [transitionCallback, setTransitionCallback] = useState(() => (_) => undefined);
  const [customHandler, setCustomHandler] = useState<CustomHandler>(() => (_) => undefined);

  const getUserConfirmation = useCallback((message, callback) => {
    setTransitioning(true);
    setTransitionMessage(message);
    setTransitionCallback(() => callback);
  }, []);

  const onModalHide = useCallback(() => {
    setTransitioning(false);
    transitionCallback(false);
    customHandler(false);
  }, []);

  const onModalLeave = useCallback(() => {
    setTransitioning(false);
    transitionCallback(true);
    customHandler(true);
  }, []);

  const railsContext = React.useMemo(() => ({ railsUser }), [railsUser]);
  const blockerContext = React.useMemo(() => ({ setCustomHandler }), [setCustomHandler]);
  return (
    // <DndProvider backend={HTML5Backend}>
      <RailsContext.Provider value={railsContext}>
        <BlockerContext.Provider value={blockerContext}>
          <BrowserRouter
            getUserConfirmation={getUserConfirmation}
          >
            <Modal
              show={transitioning}
              onHide={onModalHide}
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
                  onClick={onModalHide}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={onModalLeave}
                >
                  Leave
                </Button>
              </Modal.Footer>
            </Modal>
            <Switch>
              <Route path="/exams/:examId" exact>
                <Exam />
              </Route>
              <Route path="/">
                <RegularNavbar />
                <Container>
                  <AllAlerts>
                    <Switch>
                      <Route exact path="/">
                        <Exams />
                      </Route>
                      <Route path="/exams/:examId/admin">
                        <ExamAdmin />
                      </Route>
                      <Route path="/exams/:examId/versions/:versionId/edit" exact>
                        <EditExamVersion />
                      </Route>
                      <Route path="/exams/:examId/seating" exact>
                        <StudentDND />
                      </Route>
                      <Route path="/exams/:examId/allocate-versions" exact>
                        <AllocateVersions />
                      </Route>
                      <Route path="/exams/:examId/assign-staff" exact>
                        <AssignStaff />
                      </Route>
                      <Route path="/courses/:courseId">
                        <ShowCourse />
                      </Route>
                      <Route path="*">
                        TODO: 404!
                      </Route>
                    </Switch>
                  </AllAlerts>
                </Container>
              </Route>
            </Switch>
          </BrowserRouter>
        </BlockerContext.Provider>
      </RailsContext.Provider>
    // </DndProvider>
  );
});

// ts-prune-ignore-next
export default hot(module)(Entry);
