import { hot } from 'react-hot-loader';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { useContext, useState, useEffect } from 'react';
import { RailsContext } from '@student/exams/show/context';
import RegularNavbar from '@hourglass/common/navbar';
import { Container, Modal, Button } from 'react-bootstrap';
import {
  BrowserRouter,
  Route,
  Switch,
  useParams,
  Prompt,
} from 'react-router-dom';
import * as ApiStudentExamsShow from '@hourglass/common/api/student/exams/show';
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
import Home from '@hourglass/workflows/home';

import { RelayEnvironmentProvider } from 'relay-hooks';
import environment from '@hourglass/relay/environment';

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
  const [transitioning, setTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [transitionCallback, setTransitionCallback] = useState(() => (_) => undefined);
  const [customHandler, setCustomHandler] = useState<CustomHandler>(() => (_) => undefined);
  return (
    <RelayEnvironmentProvider environment={environment}>
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
                          <Home />
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
    </RelayEnvironmentProvider>
  );
};

// ts-prune-ignore-next
export default hot(module)(Entry);
