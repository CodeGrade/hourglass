import { hot } from 'react-hot-loader';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { useContext } from 'react';
import { RailsContext } from '@student/exams/show/context';
import RegularNavbar from '@hourglass/common/navbar';
import { Container } from 'react-bootstrap';
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  useParams,
} from 'react-router-dom';
import * as ApiMe from '@hourglass/common/api/me';
import * as ApiStudentExamsShow from '@hourglass/common/api/student/exams/show';
import * as ApiStudentReg from '@hourglass/common/api/student/registrations';
import * as ApiProfessorCourses from '@hourglass/common/api/professor/courses';
import ShowExam from '@student/exams/show';
import ShowCourse from '@professor/courses/show';
import ExamAdmin from '@professor/exams/admin';
import EditExam from '@professor/exams/edit';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import Archive from '@hourglass/common/archive';
import StudentDND from '@hourglass/common/student-dnd';

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

const Exams: React.FC<{}> = () => {
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

const Exam: React.FC<{}> = () => {
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
        />
      );
    default:
      throw new ExhaustiveSwitchError(showRes);
  }
};

const Entry: React.FC<{}> = () => {
  const res = ApiMe.useResponse();
  const railsUser = res.type === 'RESULT' ? res.response.user : undefined;
  return (
    <RailsContext.Provider
      value={{
        railsUser,
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <RegularNavbar />
              <Container>
                <Exams />
              </Container>
            </Route>
            <Route exact path="/dev">
              <RegularNavbar />
              <Container>
                <Archive />
              </Container>
            </Route>
            <Route exact path="/dnddev">
              <RegularNavbar />
              <Container>
                <StudentDND />
              </Container>
            </Route>
            <Route path="/exams/:examId" exact>
              <Exam />
            </Route>
            <Route path="/exams/:examId/admin" exact>
              <RegularNavbar />
              <Container>
                <ExamAdmin />
              </Container>
            </Route>
            <Route path="/exams/:examId/edit" exact>
              <RegularNavbar />
              <Container>
                <EditExam />
              </Container>
            </Route>
            <Route path="/courses/:courseId">
              <RegularNavbar />
              <Container>
                <ShowCourse />
              </Container>
            </Route>
            <Route path="*">
              <RegularNavbar />
              <Container>
                TODO
              </Container>
            </Route>
          </Switch>
        </BrowserRouter>
      </DndProvider>
    </RailsContext.Provider>
  );
};

export default hot(module)(Entry);
