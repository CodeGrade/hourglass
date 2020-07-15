import { hot } from 'react-hot-loader';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import RegularNavbar from '@hourglass/common/navbar';
import {
  Container,
  Modal,
  Button,
} from 'react-bootstrap';
import {
  BrowserRouter,
  Route,
  Switch,
  Prompt,
} from 'react-router-dom';
import ShowExam from '@student/exams/show';
import ShowCourse from '@professor/courses/show';
import ExamAdmin from '@professor/exams/admin';
import ExamSubmissions from '@professor/exams/submissions';
import ExamProctoring from '@proctor/exams/index';
import EditExamVersion from '@professor/exams/edit';
import { AllAlerts } from '@hourglass/common/alerts';
import './index.scss';
import ErrorBoundary from '@hourglass/common/boundary';
import Home from '@hourglass/workflows/home';

import { RelayEnvironmentProvider } from 'relay-hooks';
import environment from '@hourglass/relay/environment';
import FourOhFour from './FourOhFour';

type CustomHandler = (b: boolean) => void;

interface BlockerContext {
  setCustomHandler: (f: () => CustomHandler) => void;
  setCancelText: (str: string) => void;
  setLeaveText: (str: string) => void;
}

const BlockerContext = React.createContext({} as BlockerContext);

export const BlockNav: React.FC<{
  when?: boolean;
  message: string;
  stayText: string;
  leaveText: string;
  onStay?: () => void;
  onLeave?: () => void;
}> = (props) => {
  const {
    when = true,
    message,
    stayText,
    leaveText,
    onStay,
    onLeave,
  } = props;
  const {
    setCustomHandler,
    setCancelText,
    setLeaveText,
  } = useContext(BlockerContext);
  useEffect(() => {
    setCancelText(stayText);
    setLeaveText(leaveText);
  }, [stayText, leaveText]);
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
  const [cancelText, setCancelText] = useState<string>('Stay');
  const [leaveText, setLeaveText] = useState<string>('Leave');
  const [customHandler, setCustomHandler] = useState<CustomHandler>(() => (_) => undefined);
  const contextValue = useMemo(() => ({ setCustomHandler, setCancelText, setLeaveText }), []);
  return (
    <RelayEnvironmentProvider environment={environment}>
      <BlockerContext.Provider value={contextValue}>
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
                  {cancelText}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setTransitioning(false);
                    transitionCallback(true);
                    customHandler(true);
                  }}
                >
                  {leaveText}
                </Button>
              </Modal.Footer>
            </Modal>
            <Switch>
              <Route path="/exams/:examId" exact>
                <ShowExam />
              </Route>
              <Route path="/exams/:examId/proctoring">
                <AllAlerts>
                  <ExamProctoring />
                </AllAlerts>
              </Route>
              <Route path="/">
                <ErrorBoundary>
                  <Switch>
                    <Route exact path="/">
                      <AllAlerts>
                        <RegularNavbar />
                        <Container>
                          <Home />
                        </Container>
                      </AllAlerts>
                    </Route>
                    <Route path="/exams/:examId/admin">
                      <AllAlerts>
                        <RegularNavbar />
                        <Container>
                          <ExamAdmin />
                        </Container>
                      </AllAlerts>
                    </Route>
                    <Route path="/exams/:examId/submissions">
                      <RegularNavbar />
                      <AllAlerts>
                        <Container>
                          <ExamSubmissions />
                        </Container>
                      </AllAlerts>
                    </Route>
                    <Route path="/exams/:examId/versions/:versionId/edit" exact>
                      <RegularNavbar />
                      <AllAlerts>
                        <Container>
                          <EditExamVersion />
                        </Container>
                      </AllAlerts>
                    </Route>
                    <Route path="/courses/:courseId">
                      <RegularNavbar />
                      <AllAlerts>
                        <Container>
                          <ShowCourse />
                        </Container>
                      </AllAlerts>
                    </Route>
                    <Route path="*">
                      <FourOhFour />
                    </Route>
                  </Switch>
                </ErrorBoundary>
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
